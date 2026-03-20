"""
Clear all crime reports from the database.
"""
from database import SessionLocal
from models import CrimeReport

def clear_crimes():
    db = SessionLocal()
    try:
        count = db.query(CrimeReport).delete()
        db.commit()
        print(f"Successfully deleted {count} crime reports from the database.")
    except Exception as e:
        db.rollback()
        print(f"Error deleting crimes: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    clear_crimes()
