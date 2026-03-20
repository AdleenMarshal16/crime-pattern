"""
JWT token creation and verification for admin authentication.
"""
import os
from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from database import get_db
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "crime-pattern-detection-secret-key-2024")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 8

security = HTTPBearer()


def create_access_token(
    admin_id: int,
    role: str,
    district_id: Optional[int] = None,
    expires_delta: Optional[timedelta] = None
) -> str:
    """Create a JWT access token for an authenticated admin."""
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    )
    payload = {
        "sub": str(admin_id),
        "role": role,
        "district_id": district_id,
        "exp": expire,
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def verify_token(token: str) -> dict:
    """Verify and decode a JWT token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )


def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    """FastAPI dependency: extracts and validates the current admin from JWT."""
    from models import Admin  # Avoid circular import

    payload = verify_token(credentials.credentials)
    admin_id = int(payload.get("sub"))

    admin = db.query(Admin).filter(Admin.id == admin_id).first()
    if admin is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin not found",
        )
    return admin
