import pandas as pd
import numpy as np
import joblib
import shap
import lime
import lime.lime_tabular
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 1. Load Resources ---
# Load the Pipeline (Preprocessor + Model)
pipeline = joblib.load('loan_pipeline.pkl')

# Extract components for Explainability
model_step = pipeline.named_steps['classifier']
preprocessor_step = pipeline.named_steps['preprocessor']

# Load Transformed Training Data (Required for LIME initialization)
X_train_data = joblib.load('X_train_transformed.pkl')

# Get Feature Names
feature_names = preprocessor_step.get_feature_names_out()

# --- 2. Initialize Explainers (Global Setup) ---

# Initialize SHAP
shap_explainer = shap.TreeExplainer(model_step)

# Initialize LIME
lime_explainer = lime.lime_tabular.LimeTabularExplainer(
    training_data=X_train_data,
    feature_names=feature_names,
    class_names=['Not Approved', 'Approved'],
    mode='classification'
)

# --- 3. Define Input Data Model ---
class LoanApplication(BaseModel):
    Gender: str
    Married: str
    Dependents: str
    Education: str
    Self_Employed: str
    ApplicantIncome: float
    CoapplicantIncome: float
    LoanAmount: float
    Loan_Amount_Term: float
    Credit_History: float
    Property_Area: str

@app.post("/predict")
async def predict_loan_status(application: LoanApplication):
    try:
        # Convert Input to DataFrame
        data_dict = application.dict()
        
        # Ensure 'Dependents' is treated consistently (string)
        data_dict['Dependents'] = str(data_dict['Dependents'])
        
        # Create DataFrame (Columns must match original training data order)
        input_df = pd.DataFrame([data_dict])

        # Transform Data (Text -> Numbers)
        input_transformed = preprocessor_step.transform(input_df)
        
        # Ensure it is a dense array (not sparse)
        if hasattr(input_transformed, "toarray"):
            input_transformed = input_transformed.toarray()

        # Predict
        prediction = model_step.predict(input_transformed)[0]
        probability = model_step.predict_proba(input_transformed)[0][1]

        # SHAP Explanation (Global Factors)
        shap_values = shap_explainer.shap_values(input_transformed)
        
        if isinstance(shap_values, list):
            # If list [Class0, Class1], take Class 1 (Approved)
            shap_instance = shap_values[1][0]
        elif len(np.shape(shap_values)) == 3:
            # If 3D array (Samples, Features, Classes), take Class 1
            shap_instance = shap_values[0, :, 1]
        else:
            # Fallback
            shap_instance = shap_values[0]

        # Map feature names to values and sort
        shap_factors = []
        for name, val in zip(feature_names, shap_instance):
            shap_factors.append({
                "feature": name,
                "impact_score": round(float(val), 4),
                "impact_direction": "Positive" if val > 0 else "Negative"
            })
        # Sort by absolute impact (biggest drivers first)
        shap_factors.sort(key=lambda x: abs(x["impact_score"]), reverse=True)

        # LIME Explanation (Local Rules)
        exp = lime_explainer.explain_instance(
            data_row=input_transformed[0], 
            predict_fn=model_step.predict_proba,
            num_features=3
        )
        
        # Format LIME output
        lime_factors = []
        for rule, weight in exp.as_list():
            lime_factors.append({
                "rule": rule,
                "weight": round(weight, 4),
                "impact": "Positive" if weight > 0 else "Negative"
            })

        # Final Response 
        return {
            "loan_status": "Approved" if prediction == 1 else "Not Approved",
            "confidence_score": f"{probability * 100:.2f}%",
            "explanations": {
                "summary": "Combined insights from SHAP (Overall Impact) and LIME (Specific Rules)",
                "shap_top_factors": shap_factors[:3], 
                "lime_rules": lime_factors
            }
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Prediction Error: {str(e)}")