"""
ML Pattern Engine: DBSCAN clustering for crime hotspot detection.
"""
import numpy as np
from sklearn.cluster import DBSCAN
from typing import List, Dict, Any


def detect_hotspots(
    reports: list[dict],
    eps: float = 0.01,
    min_samples: int = 3
) -> list[dict]:
    """
    Run DBSCAN clustering on crime report coordinates to find hotspots.

    Args:
        reports: List of dicts with 'latitude', 'longitude', 'severity' keys.
        eps: Maximum distance between two samples (in degrees, ~1.1km).
        min_samples: Minimum number of samples to form a cluster.

    Returns:
        List of cluster dicts: {cluster_id, center_lat, center_lng, count, avg_severity, reports}
    """
    if len(reports) < min_samples:
        return []

    coords = np.array([[r["latitude"], r["longitude"]] for r in reports])

    db = DBSCAN(eps=eps, min_samples=min_samples, metric="haversine")
    # Convert to radians for haversine metric
    coords_rad = np.radians(coords)
    labels = db.fit_predict(coords_rad)

    clusters = {}
    for idx, label in enumerate(labels):
        if label == -1:
            continue  # Noise point
        if label not in clusters:
            clusters[label] = {
                "cluster_id": int(label),
                "lats": [],
                "lngs": [],
                "severities": [],
                "count": 0,
                "report_ids": [],
            }
        clusters[label]["lats"].append(reports[idx]["latitude"])
        clusters[label]["lngs"].append(reports[idx]["longitude"])
        clusters[label]["severities"].append(reports[idx]["severity"])
        clusters[label]["count"] += 1
        if "id" in reports[idx]:
            clusters[label]["report_ids"].append(reports[idx]["id"])

    result = []
    for label, data in clusters.items():
        result.append({
            "cluster_id": data["cluster_id"],
            "center_lat": float(np.mean(data["lats"])),
            "center_lng": float(np.mean(data["lngs"])),
            "count": data["count"],
            "avg_severity": float(np.mean(data["severities"])),
            "report_ids": data["report_ids"],
        })

    # Sort by count descending (biggest hotspots first)
    result.sort(key=lambda c: c["count"], reverse=True)
    return result


def get_heatmap_data(reports: list[dict]) -> list[dict]:
    """
    Transform crime reports into heatmap-compatible data points.
    Weight = severity * density_factor.

    Args:
        reports: List with 'latitude', 'longitude', 'severity' keys.

    Returns:
        List of {lat, lng, weight} dicts for Google Maps HeatmapLayer.
    """
    heatmap_points = []
    for r in reports:
        weight = float(r["severity"])  # Base weight from severity
        heatmap_points.append({
            "lat": r["latitude"],
            "lng": r["longitude"],
            "weight": weight,
        })
    return heatmap_points
