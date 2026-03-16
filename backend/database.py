import urllib.parse
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# 1. URL-encode the password (handles the @ symbol)
db_password = "Zadfar@2026"
encoded_password = urllib.parse.quote_plus(db_password)

# 2. The crucial Pooler configurations
# Notice the .exqxvoohqqkdmwhtqvhw attached to the username!
db_user = "postgres.exqxvoohqqkdmwhtqvhw" 
db_host = "aws-1-ap-south-1.pooler.supabase.com"
db_port = "6543" # Must be 6543 for the pooler
db_name = "postgres"

# 3. Build the connection string
SQLALCHEMY_DATABASE_URL = f"postgresql://{db_user}:{encoded_password}@{db_host}:{db_port}/{db_name}"

# 4. Initialize SQLAlchemy
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()