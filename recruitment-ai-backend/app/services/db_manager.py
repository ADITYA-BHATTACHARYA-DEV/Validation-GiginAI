from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.models.audit import AuditRecord, Base

# connect_args is required for SQLite to work with FastAPI's threads
engine = create_engine(
    settings.DATABASE_URL, 
    connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class DBManager:
    def __init__(self):
        # Automatically creates the 'audits' table if it doesn't exist
        Base.metadata.create_all(bind=engine)

    def save_audit(self, audit_data: dict):
        """
        Stores or updates an audit record in the database.
        """
        db = SessionLocal()
        try:
            # Check if this candidate already has an audit
            existing = db.query(AuditRecord).filter(
                AuditRecord.candidate_id == audit_data['candidate_id']
            ).first()

            if existing:
                # Update existing record with fresh AI data
                for key, value in audit_data.items():
                    setattr(existing, key, value)
            else:
                # Create a new record
                new_record = AuditRecord(**audit_data)
                db.add(new_record)
            
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            print(f"Error saving to DB: {e}")
            return False
        finally:
            db.close()

    def get_audit_by_id(self, candidate_id: str):
        """
        Reads a specific audit result from the database.
        """
        db = SessionLocal()
        try:
            return db.query(AuditRecord).filter(
                AuditRecord.candidate_id == candidate_id
            ).first()
        finally:
            db.close()

    def get_all_audits(self):
        """
        Retrieves a list of all audited candidates for the history view.
        """
        db = SessionLocal()
        try:
            return db.query(AuditRecord).order_by(AuditRecord.created_at.desc()).all()
        finally:
            db.close()