# Crime Pattern Detection & District Management System

AI-powered crime analytics platform for Kerala's 14 districts with biometric authentication, geospatial auto-routing, DBSCAN hotspot detection, and Google Maps heatmap visualization.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 (Vite) + Tailwind CSS + @react-google-maps/api |
| Backend | Python (FastAPI) |
| Database | PostgreSQL |
| AI/ML/CV | OpenCV, face_recognition, scikit-learn (DBSCAN) |

## Folder Structure

```
Adleen/
├── backend/
│   ├── main.py                 # FastAPI application
│   ├── database.py             # SQLAlchemy connection
│   ├── models.py               # ORM models
│   ├── schemas.py              # Pydantic schemas
│   ├── auth.py                 # JWT authentication
│   ├── liveness_auth.py        # Blink detection + face matching
│   ├── district_mapping.py     # Kerala district geofencing
│   ├── ml_engine.py            # DBSCAN clustering
│   ├── evidence_vault.py       # SHA-256 hashing
│   ├── seed_db.py              # Database seeder (120+ records)
│   ├── create_admin.py         # Admin face registration CLI
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/              # LoginPage, Dashboard, ReportForm
│   │   ├── components/         # HeatmapMap, Sidebar, StatsCards, etc.
│   │   └── api/client.js       # Axios + JWT interceptor
│   ├── index.html
│   ├── vite.config.js
│   └── tailwind.config.js
└── README.md
```

## Setup

### 1. PostgreSQL
```bash
# Create the database
psql -U postgres -c "CREATE DATABASE crime_db;"
```

### 2. Backend
```bash
cd backend
pip install -r requirements.txt
python seed_db.py                    # Seed 14 districts + 120+ reports
python create_admin.py               # Register admin face via webcam
uvicorn main:app --reload --port 8000
```

### 3. Frontend
```bash
cd frontend
npm install
# Add Google Maps API key to .env:
# VITE_GOOGLE_MAPS_KEY=your_api_key_here
npm run dev
```

### 4. Access
- **Frontend**: http://localhost:5173
- **API Docs**: http://localhost:8000/docs
- **Login**: Use webcam — blink twice (requires registered face via `create_admin.py`)

## Key Features

1. **Blink-ID Login** — No passwords. `face_recognition` detects 2 blinks (using 68-point landmarks) + matches 128-d vectors.
2. **District Auto-Routing** — Reports at Piravom (9.90, 76.50) auto-route to Ernakulam admin.
3. **DBSCAN Hotspots** — Automatic crime cluster detection without pre-defined cluster count.
4. **Heatmap** — Google Maps HeatmapLayer weighted by severity and density.
5. **Evidence Vault** — SHA-256 hashed files, streamed via `shutil.copyfileobj`.
6. **Multi-Tier Admin** — Super-admin (all 14 districts) vs District-admin (restricted view).
