"""
Liveness detection (blink-based) and face encoding comparison.
Uses face_recognition for both eye landmarks (EAR) and 128-d encoding.
"""
import base64
import io
import numpy as np
import cv2
import face_recognition
from scipy.spatial import distance as dist

# Blink detection thresholds
EAR_THRESHOLD = 0.21      # Below this = eye is closed
CONSEC_FRAMES = 2          # Min consecutive frames for a blink


def compute_ear(eye_points):
    """
    Compute Eye Aspect Ratio (EAR) from 6 eye landmarks.
    EAR = (vertical_dist_1 + vertical_dist_2) / (2.0 * horizontal_dist)
    """
    if len(eye_points) != 6:
        return 0.0
    A = dist.euclidean(eye_points[1], eye_points[5])
    B = dist.euclidean(eye_points[2], eye_points[4])
    C = dist.euclidean(eye_points[0], eye_points[3])
    if C == 0:
        return 0.0
    return (A + B) / (2.0 * C)


def decode_base64_frame(frame_b64: str) -> np.ndarray:
    """Decode a base64 string to an OpenCV image (BGR)."""
    # Strip data URI prefix if present
    if "," in frame_b64:
        frame_b64 = frame_b64.split(",", 1)[1]

    img_bytes = base64.b64decode(frame_b64)
    nparr = np.frombuffer(img_bytes, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return frame


def detect_blinks_in_frames(frames_b64: list[str]) -> int:
    """
    Analyze a sequence of base64-encoded frames and count blinks.
    Returns the total number of blinks detected.
    """
    blink_count = 0
    eye_closed_frames = 0

    for frame_b64 in frames_b64:
        try:
            frame = decode_base64_frame(frame_b64)
            if frame is None:
                continue

            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            landmarks_list = face_recognition.face_landmarks(rgb_frame)

            if not landmarks_list:
                continue

            landmarks = landmarks_list[0]
            if "left_eye" not in landmarks or "right_eye" not in landmarks:
                continue

            left_eye = landmarks["left_eye"]
            right_eye = landmarks["right_eye"]

            left_ear = compute_ear(left_eye)
            right_ear = compute_ear(right_eye)
            avg_ear = (left_ear + right_ear) / 2.0

            if avg_ear < EAR_THRESHOLD:
                eye_closed_frames += 1
            else:
                if eye_closed_frames >= CONSEC_FRAMES:
                    blink_count += 1
                eye_closed_frames = 0

        except Exception:
            continue

    # Handle case where sequence ends while eyes are closed
    if eye_closed_frames >= CONSEC_FRAMES:
        blink_count += 1

    return blink_count


def get_face_encoding_from_frame(frame_b64: str) -> list[float] | None:
    """
    Extract the 128-d face encoding from a single base64-encoded frame.
    Returns None if no face is detected.
    """
    frame = decode_base64_frame(frame_b64)
    if frame is None:
        return None

    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    encodings = face_recognition.face_encodings(rgb_frame)

    if len(encodings) == 0:
        return None

    return encodings[0].tolist()


def compare_face_encoding(
    live_encoding: list[float],
    stored_encoding: list[float],
    tolerance: float = 0.6
) -> bool:
    """
    Compare a live face encoding against a stored 128-d vector.
    Returns True if the faces match (distance < tolerance).
    """
    live_arr = np.array(live_encoding)
    stored_arr = np.array(stored_encoding)
    face_distance = face_recognition.face_distance([stored_arr], live_arr)[0]
    return float(face_distance) < tolerance


def get_face_encoding_from_cv2(frame: np.ndarray) -> list[float] | None:
    """
    Extract 128-d face encoding from an OpenCV BGR frame (for create_admin.py).
    """
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    encodings = face_recognition.face_encodings(rgb_frame)
    if len(encodings) == 0:
        return None
    return encodings[0].tolist()
