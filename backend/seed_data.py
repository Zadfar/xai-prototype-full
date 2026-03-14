
from database import SessionLocal
from models import Application, AIDecision
from datetime import datetime
from dateutil.relativedelta import relativedelta
import uuid
import random

def seed_trend_data():
    db = SessionLocal()
    try:
        # Create some applications for the last 12 months
        today = datetime.utcnow()
        for i in range(12):
            month_date = today - relativedelta(months=i)
            # Create 5-10 apps per month
            num_apps = random.randint(5, 15)
            for _ in range(num_apps):
                app_id = uuid.uuid4()
                new_app = Application(
                    id=app_id,
                    created_at=month_date,
                    person_age=30,
                    person_gender='male',
                    person_education='Bachelor',
                    person_income=50000,
                    person_emp_exp=5,
                    person_home_ownership='RENT',
                    loan_amnt=10000,
                    loan_intent='PERSONAL',
                    loan_int_rate=10.0,
                    loan_percent_income=0.2,
                    cb_person_cred_hist_length=5,
                    credit_score=700,
                    previous_loan_defaults_on_file='No'
                )
                db.add(new_app)
                
                # Create decision
                status = random.choice(['Approved', 'Rejected'])
                new_decision = AIDecision(
                    application_id=app_id,
                    ai_recommended_status=status,
                    probability_of_default=0.1 if status == 'Approved' else 0.8,
                    final_status=status,
                    shap_explanations=[],
                    lime_rules=[],
                    action_plan=[]
                )
                db.add(new_decision)
        
        db.commit()
        print("Successfully seeded trend data for the last 12 months!")
    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_trend_data()
