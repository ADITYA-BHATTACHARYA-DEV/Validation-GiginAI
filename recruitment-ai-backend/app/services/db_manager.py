from sqlalchemy import create_engine # Corrected import
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.models.audit import AuditRecord, Base

# SQLAlchemy uses 'create_engine' to connect to the database
engine = create_engine(
    settings.DATABASE_URL, 
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class DBManager:
    def __init__(self):
        # This creates the tables in your recruitment.db if they don't exist
        Base.metadata.create_all(bind=engine)

    def save_audit(self, data: dict):
        db = SessionLocal()
        try:
            # Upsert logic: Update if exists, otherwise Insert
            existing = db.query(AuditRecord).filter(
                AuditRecord.candidate_id == data['candidate_id']
            ).first()
            
            if existing:
                for key, value in data.items():
                    setattr(existing, key, value)
            else:
                new_record = AuditRecord(**data)
                db.add(new_record)
            
            db.commit()
        except Exception as e:
            db.rollback()
            print(f"Database Save Error: {e}")
        finally:
            db.close()

    def get_audit(self, candidate_id: str):
        db = SessionLocal()
        try:
            return db.query(AuditRecord).filter(
                AuditRecord.candidate_id == candidate_id
            ).first()
        finally:
            db.close()