from pydantic import BaseModel, Field
from typing import Literal

class LoanApplication(BaseModel):
    person_age: float
    person_gender: str
    person_education: str
    person_income: float
    person_emp_exp: int
    person_home_ownership: str
    loan_amnt: float
    loan_intent: str
    loan_int_rate: float
    # loan_percent_income: float
    cb_person_cred_hist_length: float
    credit_score: int
    previous_loan_defaults_on_file: str

class OfficerDecision(BaseModel):
    # Only allow exact string matches to prevent database errors
    decision: Literal["Approved", "Rejected"]
    
    # Require an officer name/ID
    officer_name: str = Field(..., min_length=2, description="Name or ID of the reviewing officer")
    
    # Force them to write at least a 5-character reason for the audit trail
    override_reason: str = Field(..., min_length=5, description="Required justification for the audit log")