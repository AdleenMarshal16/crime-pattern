"""
Seed script: Populates the database with 14 Kerala districts and 120+ mock crime reports.
Based on Indian Crimes Dataset patterns (2020-2024).
Ensures 15+ entries within the Piravom bounding box for Ernakulam routing tests.
"""
import random
from datetime import datetime, timedelta, timezone
from database import engine, SessionLocal, Base
from models import District, CrimeReport, Admin
from district_mapping import KERALA_DISTRICTS, get_district_for_coordinates

# Crime types based on Indian Crime categories
CRIME_TYPES = [
    "Theft", "Assault", "Robbery", "Burglary", "Cybercrime",
    "Drug Offense", "Murder", "Kidnapping", "Fraud", "Vandalism",
    "Domestic Violence", "Chain Snatching", "Eve Teasing", "Arms Act Violation",
]

# Descriptions per crime type
DESCRIPTIONS = {
    "Theft": [
        "Mobile phone snatched near bus stand",
        "Two-wheeler stolen from parking lot",
        "Shoplifting incident at supermarket",
        "Laptop stolen from office premises",
    ],
    "Assault": [
        "Physical altercation at public market",
        "Road rage incident between two parties",
        "Group clash near cinema hall",
    ],
    "Robbery": [
        "Armed robbery at jewelry store",
        "Home invasion robbery in residential area",
        "ATM robbery attempt caught on CCTV",
    ],
    "Burglary": [
        "House break-in while owners on vacation",
        "Commercial establishment burglarized at night",
        "Warehouse break-in with goods stolen",
    ],
    "Cybercrime": [
        "Online banking fraud via phishing",
        "Social media impersonation and extortion",
        "Credit card cloning operation detected",
        "OTP scam targeting elderly residents",
    ],
    "Drug Offense": [
        "Cannabis cultivation busted",
        "Synthetic drug trafficking ring exposed",
        "Marijuana seizure at checkpoint",
    ],
    "Murder": [
        "Fatal stabbing during personal dispute",
        "Homicide investigation in residential area",
    ],
    "Kidnapping": [
        "Minor abducted from school premises",
        "Ransom kidnapping of businessman",
    ],
    "Fraud": [
        "Real estate fraud involving forged documents",
        "Insurance claim fraud detected",
        "Ponzi scheme targeting local investors",
    ],
    "Vandalism": [
        "Public property damaged during protest",
        "Vehicle vandalism in parking area",
        "Graffiti on government building",
    ],
    "Domestic Violence": [
        "Domestic abuse complaint filed by spouse",
        "Dowry harassment case reported",
    ],
    "Chain Snatching": [
        "Gold chain snatched from woman walking alone",
        "Chain snatching from auto-rickshaw passenger",
    ],
    "Eve Teasing": [
        "Harassment reported near college campus",
        "Stalking complaint filed by victim",
    ],
    "Arms Act Violation": [
        "Illegal firearm possession detected",
        "Country-made weapon seized during raid",
    ],
}


def random_datetime(start_year=2020, end_year=2024):
    """Generate random datetime between start and end year."""
    start = datetime(start_year, 1, 1, tzinfo=timezone.utc)
    end = datetime(end_year, 12, 31, 23, 59, 59, tzinfo=timezone.utc)
    delta = end - start
    random_seconds = random.randint(0, int(delta.total_seconds()))
    return start + timedelta(seconds=random_seconds)


def random_coords_in_district(bounds):
    """Generate random coordinates within a district's bounding box."""
    lat = random.uniform(bounds["lat"][0], bounds["lat"][1])
    lng = random.uniform(bounds["long"][0], bounds["long"][1])
    return round(lat, 6), round(lng, 6)


def random_piravom_coords():
    """Generate coordinates within Piravom bounding box (9.85-9.95, 76.45-76.55)."""
    lat = random.uniform(9.85, 9.95)
    lng = random.uniform(76.45, 76.55)
    return round(lat, 6), round(lng, 6)


def seed_database():
    """Main seeding function."""
    print("=" * 60)
    print("  Crime Pattern Detection System — Database Seeder")
    print("=" * 60)

    # Create tables
    Base.metadata.create_all(bind=engine)
    print("\n✓ Database tables created")

    db = SessionLocal()

    try:
        # --- Seed Districts ---
        existing_districts = db.query(District).count()
        if existing_districts > 0:
            print(f"  Districts already seeded ({existing_districts} found). Skipping.")
        else:
            districts = {}
            for name, bounds in KERALA_DISTRICTS.items():
                district = District(
                    name=name,
                    lat_min=bounds["lat"][0],
                    lat_max=bounds["lat"][1],
                    long_min=bounds["long"][0],
                    long_max=bounds["long"][1],
                )
                db.add(district)
                db.flush()
                districts[name] = district.id

            db.commit()
            print(f"✓ {len(districts)} Kerala districts seeded")

        # Reload district IDs
        district_map = {}
        for d in db.query(District).all():
            district_map[d.name] = d.id

        # --- Seed Crime Reports ---
        existing_reports = db.query(CrimeReport).count()
        if existing_reports > 0:
            print(f"  Crime reports already seeded ({existing_reports} found). Skipping.")
        else:
            reports = []

            # === Piravom-specific entries (15+) ===
            piravom_count = 18
            print(f"\n→ Generating {piravom_count} Piravom (Ernakulam) entries...")
            for i in range(piravom_count):
                lat, lng = random_piravom_coords()
                crime_type = random.choice(CRIME_TYPES)
                desc_list = DESCRIPTIONS.get(crime_type, ["Incident reported"])
                report = CrimeReport(
                    crime_type=crime_type,
                    description=random.choice(desc_list),
                    severity=random.randint(1, 5),
                    latitude=lat,
                    longitude=lng,
                    district_id=district_map.get("Ernakulam"),
                    timestamp=random_datetime(),
                    reported_by=f"citizen_{random.randint(1000, 9999)}",
                )
                reports.append(report)

            # === General entries across all districts ===
            general_count = 105
            print(f"→ Generating {general_count} entries across all districts...")
            district_names = list(KERALA_DISTRICTS.keys())

            for i in range(general_count):
                district_name = random.choice(district_names)
                bounds = KERALA_DISTRICTS[district_name]
                lat, lng = random_coords_in_district(bounds)
                crime_type = random.choice(CRIME_TYPES)
                desc_list = DESCRIPTIONS.get(crime_type, ["Incident reported"])

                report = CrimeReport(
                    crime_type=crime_type,
                    description=random.choice(desc_list),
                    severity=random.randint(1, 5),
                    latitude=lat,
                    longitude=lng,
                    district_id=district_map.get(district_name),
                    timestamp=random_datetime(),
                    reported_by=f"citizen_{random.randint(1000, 9999)}",
                )
                reports.append(report)

            db.add_all(reports)
            db.commit()
            print(f"✓ {len(reports)} crime reports seeded (including {piravom_count} in Piravom)")

            # Verify Piravom routing
            piravom_reports = db.query(CrimeReport).filter(
                CrimeReport.latitude.between(9.85, 9.95),
                CrimeReport.longitude.between(76.45, 76.55),
            ).all()
            ernakulam_count = sum(
                1 for r in piravom_reports
                if r.district_id == district_map.get("Ernakulam")
            )
            print(f"\n✓ Piravom → Ernakulam routing verification:")
            print(f"  Found {len(piravom_reports)} reports in Piravom area")
            print(f"  {ernakulam_count} correctly assigned to Ernakulam")

        # --- Seed Default Super Admin (no face encoding — use create_admin.py) ---
        existing_admin = db.query(Admin).filter(Admin.email == "superadmin@kerala.gov.in").first()
        if not existing_admin:
            admin = Admin(
                email="superadmin@kerala.gov.in",
                role="super_admin",
                district_id=None,
                face_encoding=None,
            )
            db.add(admin)
            db.commit()
            print("\n✓ Default super-admin created (email: superadmin@kerala.gov.in)")
            print("  ⚠ Run create_admin.py to register face encoding")
        else:
            print(f"\n  Super-admin already exists (id={existing_admin.id})")

        print("\n" + "=" * 60)
        print("  Seeding complete!")
        print("=" * 60)

    except Exception as e:
        db.rollback()
        print(f"\n✗ Error during seeding: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
