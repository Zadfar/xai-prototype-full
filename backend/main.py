import traceback
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import __main__

# Import your new modules
from schemas import LoanApplication
from ml_service import MLExplainabilityService
from custom_transforms import log_income

# --- NEW DATABASE IMPORTS ---
from database import engine, Base, get_db
import dashboard
from models import Application, AIDecision

# Inject custom function for joblib to locate it properly during unpickling
setattr(__main__, "log_income", log_income)

ml_service = MLExplainabilityService()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create the database tables in Supabase if they don't exist yet
    Base.metadata.create_all(bind=engine)
    
    # Load models when server starts
    ml_service.load_resources()
    yield
    # Clean up resources when server stops
    ml_service.pipeline = None

app = FastAPI(title="Loan Risk Assessment API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- REGISTER DASHBOARD ROUTER ---
app.include_router(dashboard.router)

# --- UPDATED PREDICT ENDPOINT ---
# Notice we added `db: Session = Depends(get_db)` to the parameters
@app.post("/predict")
async def predict(application: LoanApplication, db: Session = Depends(get_db)):
    if not ml_service.pipeline:
        raise HTTPException(status_code=503, detail="Model pipeline is not loaded.")
    
    try:
        input_data = application.model_dump()
        
        # 1. Server-side math
        safe_income = max(input_data["person_income"], 1)
        input_data["loan_percent_income"] = input_data["loan_amnt"] / safe_income
        
        # ---------------------------------------------------------
        # 2. SAVE APPLICANT INFO TO DATABASE
        # ---------------------------------------------------------
        new_app = Application(**input_data)
        db.add(new_app)
        db.commit()
        db.refresh(new_app) # Refresh to grab the newly generated UUID

        # 3. Run the AI Prediction
        result = ml_service.predict_and_explain(input_data)
        
        # ---------------------------------------------------------
        # 4. DASHBOARD LOGIC: THE "GRAY AREA" THRESHOLD
        # ---------------------------------------------------------
        # Convert the string percentage (e.g., "65.50%") back to a decimal for logic
        prob_float = float(result["probability_of_default"].strip('%')) / 100

        if prob_float > 0.60:
            ai_status = "Rejected"
            final_status = "Rejected"
        elif prob_float > 0.20:
            ai_status = "Manual Review"
            final_status = "Pending"  # Stops here! Waiting for the loan officer
        else:
            ai_status = "Approved"
            final_status = "Approved"

        # Update the message sent back to the applicant if it's under review
        if final_status == "Pending":
            result["loan_status"] = "Under Manual Review"

        # ---------------------------------------------------------
        # 5. SAVE AI DECISION & EXPLANATIONS TO DATABASE
        # ---------------------------------------------------------
        new_decision = AIDecision(
            application_id=new_app.id,
            ai_recommended_status=ai_status,
            probability_of_default=prob_float,
            shap_explanations=result["explanations"].get("shap_top_factors", []),
            lime_rules=result["explanations"].get("lime_rules", []),
            action_plan=result.get("action_plan", []),
            final_status=final_status
        )
        db.add(new_decision)
        db.commit()

        # Attach the database ID to the response so the frontend has a reference
        result["application_id"] = str(new_app.id)

        return result

    except ValueError as ve:
        db.rollback() # Cancel database transaction if something fails
        raise HTTPException(status_code=422, detail=str(ve))
    except Exception as e:
        db.rollback() # Cancel database transaction if something fails
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)