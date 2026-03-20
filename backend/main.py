"""
Crime Pattern Detection & District Management System — FastAPI Application.
"""
import os
from datetime import datetime, timezone
from typing import Optional
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import func, extract

from database import engine, Base, get_db
from models import Admin, District, CrimeReport
from schemas import (
    CrimeReportCreate, CrimeReportOut, DistrictOut, AdminOut,
    LoginRequest, TokenResponse, HeatmapPoint, DashboardStats,
)
from auth import create_access_token, get_current_admin
from district_mapping import get_district_for_coordinates
from evidence_vault import hash_and_store
from ml_engine import detect_hotspots, get_heatmap_data
from liveness_auth import (
    detect_blinks_in_frames,
    get_face_encoding_from_frame,
    compare_face_encoding,
)

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Crime Pattern Detection & District Management",
    description="AI-powered crime analytics platform for Kerala's 14 districts",
    version="1.0.0",
)

# CORS for frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded evidence files
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


# ========================================================
#                   AUTH ENDPOINTS
# ========================================================

@app.post("/api/auth/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """
    Blink-ID Login: Verify liveness (2+ blinks) then match face encoding.
    Receives a list of base64-encoded webcam frames.
    """
    if not request.frames or len(request.frames) < 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient frames. Please capture at least 5 frames.",
        )

    # Step 1: Detect blinks (liveness)
    blink_count = detect_blinks_in_frames(request.frames)
    if blink_count < 2:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Liveness check failed. Detected {blink_count} blink(s), need at least 2.",
        )

    # Step 2: Get face encoding from the best frame (middle frame)
    mid_idx = len(request.frames) // 2
    live_encoding = get_face_encoding_from_frame(request.frames[mid_idx])
    if live_encoding is None:
        # Try last frame as fallback
        live_encoding = get_face_encoding_from_frame(request.frames[-1])
    if live_encoding is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not detect face in frames. Please ensure good lighting.",
        )

    # Step 3: Match against stored admin face encodings
    admins = db.query(Admin).filter(Admin.face_encoding.isnot(None)).all()
    matched_admin = None
    for admin in admins:
        if compare_face_encoding(live_encoding, admin.face_encoding):
            matched_admin = admin
            break

    if matched_admin is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Face not recognized. Access denied.",
        )

    # Step 4: Create JWT token
    token = create_access_token(
        admin_id=matched_admin.id,
        role=matched_admin.role,
        district_id=matched_admin.district_id,
    )

    district_name = None
    if matched_admin.district:
        district_name = matched_admin.district.name

    return TokenResponse(
        access_token=token,
        admin=AdminOut(
            id=matched_admin.id,
            email=matched_admin.email,
            role=matched_admin.role,
            district_id=matched_admin.district_id,
            district_name=district_name,
            created_at=matched_admin.created_at,
        ),
    )


@app.get("/api/auth/me", response_model=AdminOut)
def get_me(admin: Admin = Depends(get_current_admin)):
    """Return current authenticated admin info."""
    district_name = admin.district.name if admin.district else None
    return AdminOut(
        id=admin.id,
        email=admin.email,
        role=admin.role,
        district_id=admin.district_id,
        district_name=district_name,
        created_at=admin.created_at,
    )


# ========================================================
#                   DISTRICT ENDPOINTS
# ========================================================

@app.get("/api/districts", response_model=list[DistrictOut])
def list_districts(db: Session = Depends(get_db)):
    """List all 14 Kerala districts."""
    return db.query(District).order_by(District.name).all()


# ========================================================
#                 CRIME REPORT ENDPOINTS
# ========================================================

@app.post("/api/reports", response_model=CrimeReportOut)
def create_report(
    report: CrimeReportCreate,
    db: Session = Depends(get_db),
):
    """
    Submit a new crime report. Auto-routes to the correct district.
    """
    # Auto-detect district from coordinates
    district_name = get_district_for_coordinates(report.latitude, report.longitude)
    district_id = None
    if district_name:
        district = db.query(District).filter(District.name == district_name).first()
        if district:
            district_id = district.id

    db_report = CrimeReport(
        crime_type=report.crime_type,
        description=report.description,
        severity=max(1, min(5, report.severity)),  # Clamp 1-5
        latitude=report.latitude,
        longitude=report.longitude,
        district_id=district_id,
        timestamp=report.timestamp or datetime.now(timezone.utc),
        reported_by=report.reported_by,
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)

    district_name_out = None
    if db_report.district:
        district_name_out = db_report.district.name

    return CrimeReportOut(
        id=db_report.id,
        crime_type=db_report.crime_type,
        description=db_report.description,
        severity=db_report.severity,
        latitude=db_report.latitude,
        longitude=db_report.longitude,
        district_id=db_report.district_id,
        district_name=district_name_out,
        timestamp=db_report.timestamp,
        evidence_hash=db_report.evidence_hash,
        reported_by=db_report.reported_by,
        created_at=db_report.created_at,
    )


@app.get("/api/reports", response_model=list[CrimeReportOut])
def list_reports(
    district_id: Optional[int] = Query(None),
    crime_type: Optional[str] = Query(None),
    severity_min: Optional[int] = Query(None),
    severity_max: Optional[int] = Query(None),
    limit: int = Query(100, le=500),
    offset: int = Query(0),
    db: Session = Depends(get_db),
):
    """
    List crime reports with optional filters.
    District admins should pass their district_id to filter.
    """
    query = db.query(CrimeReport)

    if district_id is not None:
        query = query.filter(CrimeReport.district_id == district_id)
    if crime_type:
        query = query.filter(CrimeReport.crime_type == crime_type)
    if severity_min is not None:
        query = query.filter(CrimeReport.severity >= severity_min)
    if severity_max is not None:
        query = query.filter(CrimeReport.severity <= severity_max)

    reports = query.order_by(CrimeReport.timestamp.desc()).offset(offset).limit(limit).all()

    result = []
    for r in reports:
        d_name = r.district.name if r.district else None
        result.append(CrimeReportOut(
            id=r.id,
            crime_type=r.crime_type,
            description=r.description,
            severity=r.severity,
            latitude=r.latitude,
            longitude=r.longitude,
            district_id=r.district_id,
            district_name=d_name,
            timestamp=r.timestamp,
            evidence_hash=r.evidence_hash,
            reported_by=r.reported_by,
            created_at=r.created_at,
        ))
    return result


# ========================================================
#                 EVIDENCE ENDPOINTS
# ========================================================

@app.post("/api/evidence/upload")
def upload_evidence(
    file: UploadFile = File(...),
    report_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    """
    Upload evidence file. SHA-256 hashed and stored securely.
    Optionally links to a crime report.
    """
    file_hash = hash_and_store(file)

    if report_id:
        report = db.query(CrimeReport).filter(CrimeReport.id == report_id).first()
        if report:
            report.evidence_hash = file_hash
            db.commit()

    return {
        "hash": file_hash,
        "filename": f"{file_hash}{os.path.splitext(file.filename or '')[1]}",
        "message": "Evidence uploaded and hashed successfully",
    }


# ========================================================
#                 HEATMAP / ML ENDPOINTS
# ========================================================

@app.get("/api/heatmap", response_model=list[HeatmapPoint])
def get_heatmap(
    district_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    """Return heatmap data points weighted by severity."""
    query = db.query(CrimeReport)
    if district_id is not None:
        query = query.filter(CrimeReport.district_id == district_id)

    reports = query.all()
    report_dicts = [
        {"latitude": r.latitude, "longitude": r.longitude, "severity": r.severity}
        for r in reports
    ]
    return get_heatmap_data(report_dicts)


@app.get("/api/clusters")
def get_clusters(
    district_id: Optional[int] = Query(None),
    eps: float = Query(0.01),
    min_samples: int = Query(3),
    db: Session = Depends(get_db),
):
    """Return DBSCAN hotspot clusters."""
    query = db.query(CrimeReport)
    if district_id is not None:
        query = query.filter(CrimeReport.district_id == district_id)

    reports = query.all()
    report_dicts = [
        {
            "id": r.id,
            "latitude": r.latitude,
            "longitude": r.longitude,
            "severity": r.severity,
        }
        for r in reports
    ]
    return detect_hotspots(report_dicts, eps=eps, min_samples=min_samples)


# ========================================================
#                 DASHBOARD STATS
# ========================================================

@app.get("/api/stats", response_model=DashboardStats)
def get_stats(
    district_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    """Return dashboard summary statistics."""
    query = db.query(CrimeReport)
    if district_id is not None:
        query = query.filter(CrimeReport.district_id == district_id)

    total_reports = query.count()

    # Today's alerts
    today = datetime.now(timezone.utc).date()
    today_alerts = query.filter(
        func.date(CrimeReport.timestamp) == today
    ).count()

    # Districts covered
    districts_covered = db.query(
        func.count(func.distinct(CrimeReport.district_id))
    ).scalar() or 0

    # Active hotspots (clusters with 3+ reports)
    all_reports = query.all()
    report_dicts = [
        {"latitude": r.latitude, "longitude": r.longitude, "severity": r.severity}
        for r in all_reports
    ]
    hotspots = detect_hotspots(report_dicts)
    active_hotspots = len(hotspots)

    # Severity distribution
    severity_dist = {}
    for i in range(1, 6):
        count = query.filter(CrimeReport.severity == i).count()
        severity_dist[str(i)] = count

    # Crime type distribution
    crime_type_dist = {}
    type_counts = db.query(
        CrimeReport.crime_type, func.count(CrimeReport.id)
    ).group_by(CrimeReport.crime_type).all()
    for ct, count in type_counts:
        crime_type_dist[ct] = count

    return DashboardStats(
        total_reports=total_reports,
        active_hotspots=active_hotspots,
        today_alerts=today_alerts,
        districts_covered=districts_covered,
        severity_distribution=severity_dist,
        crime_type_distribution=crime_type_dist,
    )


# ========================================================
#                    ROOT
# ========================================================

@app.get("/")
def root():
    """API health check."""
    return {
        "name": "Crime Pattern Detection & District Management System",
        "version": "1.0.0",
        "status": "operational",
    }
