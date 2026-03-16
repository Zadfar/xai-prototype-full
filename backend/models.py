import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship
from database import Base

class Application(Base):
    __tablename__ = "applications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Applicant Details
    person_age = Column(Integer)
    person_gender = Column(String)
    person_education = Column(String)
    person_home_ownership = Column(String)
    person_income = Column(Float)
    person_emp_exp = Column(Integer)
    
    # Loan Details
    loan_amnt = Column(Float)
    loan_intent = Column(String)
    loan_int_rate = Column(Float)
    loan_percent_income = Column(Float)
    
    # Credit Profile
    cb_person_cred_hist_length = Column(Integer)
    credit_score = Column(Integer)
    previous_loan_defaults_on_file = Column(String)

    # Relationship to the decision
    decision = relationship("AIDecision", back_populates="application", uselist=False)

class AIDecision(Base):
    __tablename__ = "ai_decisions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    application_id = Column(UUID(as_uuid=True), ForeignKey("applications.id"))
    
    # AI Outputs
    ai_recommended_status = Column(String) # "Approved", "Rejected", "Manual Review"
    probability_of_default = Column(Float)
    shap_explanations = Column(JSONB) # Stores the array of dicts
    lime_rules = Column(JSONB)
    action_plan = Column(JSONB)       # Stores the DiCE counterfactuals
    
    # Human Officer Overrides
    final_status = Column(String, default="Pending") # "Approved", "Rejected", "Pending"
    reviewed_by_officer = Column(String, nullable=True)
    override_reason = Column(String, nullable=True)
    reviewed_at = Column(DateTime, nullable=True)

    application = relationship("Application", back_populates="decision")