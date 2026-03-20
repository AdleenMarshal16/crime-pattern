"""
SQLAlchemy ORM models for the Crime Pattern Detection System.
"""
from sqlalchemy import (
    Column, Integer, String, Float, DateTime, ForeignKey, Text, ARRAY
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class District(Base):
    __tablename__ = "districts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    lat_min = Column(Float, nullable=False)
    lat_max = Column(Float, nullable=False)
    long_min = Column(Float, nullable=False)
    long_max = Column(Float, nullable=False)

    admins = relationship("Admin", back_populates="district")
    crime_reports = relationship("CrimeReport", back_populates="district")


class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    role = Column(String(50), nullable=False, default="district_admin")  # super_admin | district_admin
    district_id = Column(Integer, ForeignKey("districts.id"), nullable=True)
    face_encoding = Column(ARRAY(Float), nullable=True)  # 128-d vector
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    district = relationship("District", back_populates="admins")


class CrimeReport(Base):
    __tablename__ = "crime_reports"

    id = Column(Integer, primary_key=True, index=True)
    crime_type = Column(String(100), nullable=False, index=True)
    description = Column(Text, nullable=True)
    severity = Column(Integer, nullable=False)  # 1-5
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    district_id = Column(Integer, ForeignKey("districts.id"), nullable=True)
    timestamp = Column(DateTime(timezone=True), nullable=False)
    evidence_hash = Column(String(64), nullable=True)  # SHA-256
    reported_by = Column(String(255), nullable=True)
    status = Column(String(50), nullable=False, default="pending", server_default="pending")  # pending | investigating | resolved
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    district = relationship("District", back_populates="crime_reports")
