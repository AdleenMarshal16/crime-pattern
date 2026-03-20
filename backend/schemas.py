"""
Pydantic schemas for request/response validation.
"""
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# --- District ---
class DistrictOut(BaseModel):
    id: int
    name: str
    lat_min: float
    lat_max: float
    long_min: float
    long_max: float

    class Config:
        from_attributes = True


# --- Admin ---
class AdminOut(BaseModel):
    id: int
    email: str
    role: str
    district_id: Optional[int] = None
    district_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# --- Crime Report ---
class CrimeReportCreate(BaseModel):
    crime_type: str
    description: Optional[str] = None
    severity: int  # 1-5
    latitude: float
    longitude: float
    timestamp: Optional[datetime] = None
    reported_by: Optional[str] = None


class CrimeReportOut(BaseModel):
    id: int
    crime_type: str
    description: Optional[str] = None
    severity: int
    latitude: float
    longitude: float
    district_id: Optional[int] = None
    district_name: Optional[str] = None
    timestamp: datetime
    evidence_hash: Optional[str] = None
    reported_by: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# --- Auth ---
class LoginRequest(BaseModel):
    frames: List[str]  # List of base64-encoded frame images


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    admin: AdminOut


# --- Heatmap ---
class HeatmapPoint(BaseModel):
    lat: float
    lng: float
    weight: float


# --- Stats ---
class DashboardStats(BaseModel):
    total_reports: int
    active_hotspots: int
    today_alerts: int
    districts_covered: int
    severity_distribution: dict
    crime_type_distribution: dict
