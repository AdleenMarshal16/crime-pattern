"""
Kerala district coordinate mapping and auto-routing logic.
"""

KERALA_DISTRICTS = {
    "Ernakulam": {"lat": (9.75, 10.30), "long": (76.15, 76.80)},
    "Thiruvananthapuram": {"lat": (8.25, 8.85), "long": (76.65, 77.30)},
    "Kollam": {"lat": (8.75, 9.20), "long": (76.45, 77.25)},
    "Pathanamthitta": {"lat": (9.10, 9.55), "long": (76.40, 77.30)},
    "Alappuzha": {"lat": (9.00, 9.85), "long": (76.25, 76.60)},
    "Kottayam": {"lat": (9.35, 9.85), "long": (76.35, 76.90)},
    "Idukki": {"lat": (9.25, 10.35), "long": (76.60, 77.40)},
    "Thrissur": {"lat": (10.15, 10.85), "long": (75.95, 76.75)},
    "Palakkad": {"lat": (10.35, 11.25), "long": (76.05, 76.95)},
    "Malappuram": {"lat": (10.70, 11.55), "long": (75.80, 76.55)},
    "Kozhikode": {"lat": (11.15, 11.85), "long": (75.55, 76.15)},
    "Wayanad": {"lat": (11.45, 12.00), "long": (75.80, 76.45)},
    "Kannur": {"lat": (11.70, 12.30), "long": (75.15, 76.00)},
    "Kasaragod": {"lat": (12.10, 12.80), "long": (74.85, 75.45)},
}


def get_district_for_coordinates(lat: float, lng: float) -> str | None:
    """
    Given latitude and longitude, returns the matching Kerala district name.
    Uses a priority-based approach: smaller/more specific bounding boxes first.
    Returns None if coordinates don't fall within any district.
    """
    # Sort districts by bounding box area (smallest first) for precision
    districts_by_area = sorted(
        KERALA_DISTRICTS.items(),
        key=lambda d: (d[1]["lat"][1] - d[1]["lat"][0]) * (d[1]["long"][1] - d[1]["long"][0])
    )

    for name, bounds in districts_by_area:
        lat_min, lat_max = bounds["lat"]
        long_min, long_max = bounds["long"]
        if lat_min <= lat <= lat_max and long_min <= lng <= long_max:
            return name

    return None


def get_all_districts() -> dict:
    """Returns the full district mapping dictionary."""
    return KERALA_DISTRICTS


if __name__ == "__main__":
    # Test: Piravom (Lat: 9.90, Long: 76.50) should map to Ernakulam
    result = get_district_for_coordinates(9.90, 76.50)
    print(f"Piravom (9.90, 76.50) -> {result}")
    assert result == "Ernakulam", f"Expected Ernakulam, got {result}"
    print("✓ District routing test PASSED")
