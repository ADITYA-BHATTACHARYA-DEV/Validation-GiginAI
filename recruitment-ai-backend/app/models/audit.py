from sqlalchemy import Column, String, Float, JSON, DateTime, Integer
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class AuditRecord(Base):
    __tablename__ = "audits"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(String, unique=True, index=True)
    audit_report = Column(String)
    depth_score = Column(Float)
    retention_risk = Column(String)
    retention_percentage = Column(Integer)
    retention_reasoning = Column(String)
    experience_json = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)