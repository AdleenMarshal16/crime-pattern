import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

def run_migration():
    load_dotenv()
    DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/crime_db")
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        print("Checking if status column exists in crime_reports...")
        
        # PostgreSQL syntax to check for column existence
        result = conn.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='crime_reports' and column_name='status';
        """)).fetchone()
        
        if not result:
            print("Adding 'status' column to 'crime_reports'...")
            conn.execute(text("ALTER TABLE crime_reports ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'pending';"))
            conn.commit()
            print("Migration successful.")
        else:
            print("Status column already exists. No migration needed.")

if __name__ == "__main__":
    run_migration()
