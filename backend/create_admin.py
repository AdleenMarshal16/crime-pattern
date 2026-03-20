"""
Admin provisioning CLI: Register an admin's face, email, and district via webcam.
Captures a face encoding (128-d vector) and stores it in PostgreSQL.
"""
import sys
import cv2
from database import SessionLocal, engine, Base
from models import Admin, District
from liveness_auth import get_face_encoding_from_cv2


def list_districts(db):
    """Display available districts."""
    districts = db.query(District).order_by(District.name).all()
    print("\nAvailable Districts:")
    print("-" * 40)
    for d in districts:
        print(f"  [{d.id}] {d.name}")
    print("-" * 40)
    return districts


def capture_face_encoding():
    """Capture face encoding from webcam."""
    print("\n📷 Opening webcam for face capture...")
    print("   Position your face in the frame and press SPACE to capture.")
    print("   Press 'q' to cancel.\n")

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("✗ Error: Could not open webcam")
        return None

    encoding = None
    while True:
        ret, frame = cap.read()
        if not ret:
            print("✗ Error: Could not read frame")
            break

        # Draw guide rectangle
        h, w = frame.shape[:2]
        cv2.rectangle(frame, (w // 4, h // 6), (3 * w // 4, 5 * h // 6), (0, 255, 0), 2)
        cv2.putText(
            frame, "Position face in box. SPACE=capture, Q=quit",
            (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2
        )

        cv2.imshow("Admin Face Registration", frame)
        key = cv2.waitKey(1) & 0xFF

        if key == ord(" "):  # Space bar to capture
            print("   Capturing face encoding...")
            encoding = get_face_encoding_from_cv2(frame)
            if encoding:
                print("   ✓ Face encoding captured (128-d vector)")
                break
            else:
                print("   ✗ No face detected. Try again.")

        elif key == ord("q"):
            print("   Cancelled.")
            break

    cap.release()
    cv2.destroyAllWindows()
    return encoding


def main():
    """Main admin provisioning flow."""
    print("=" * 60)
    print("  Admin Registration — Crime Pattern Detection System")
    print("=" * 60)

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Step 1: Get email
        email = input("\nEnter admin email: ").strip()
        if not email:
            print("✗ Email is required")
            return

        # Check for duplicate
        existing = db.query(Admin).filter(Admin.email == email).first()
        if existing:
            update = input(f"  Admin '{email}' already exists. Update face encoding? (y/n): ").strip()
            if update.lower() != "y":
                return

        # Step 2: Select role
        print("\nSelect role:")
        print("  [1] Super Admin (access to all districts)")
        print("  [2] District Admin (restricted to one district)")
        role_choice = input("Choice (1/2): ").strip()

        if role_choice == "1":
            role = "super_admin"
            district_id = None
            print("  → Role: Super Admin")
        else:
            role = "district_admin"
            districts = list_districts(db)
            if not districts:
                print("✗ No districts found. Run seed_db.py first.")
                return
            district_id_input = input("Enter district ID: ").strip()
            try:
                district_id = int(district_id_input)
                district = db.query(District).filter(District.id == district_id).first()
                if not district:
                    print("✗ Invalid district ID")
                    return
                print(f"  → Role: District Admin for {district.name}")
            except ValueError:
                print("✗ Invalid input")
                return

        # Step 3: Capture face
        encoding = capture_face_encoding()
        if encoding is None:
            print("✗ Face capture failed. Admin not created.")
            return

        # Step 4: Save to database
        if existing:
            existing.face_encoding = encoding
            existing.role = role
            existing.district_id = district_id
            db.commit()
            print(f"\n✓ Admin '{email}' updated successfully (id={existing.id})")
        else:
            admin = Admin(
                email=email,
                role=role,
                district_id=district_id,
                face_encoding=encoding,
            )
            db.add(admin)
            db.commit()
            print(f"\n✓ Admin '{email}' created successfully (id={admin.id})")

        print("=" * 60)

    except KeyboardInterrupt:
        print("\n\nCancelled.")
    except Exception as e:
        db.rollback()
        print(f"\n✗ Error: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
