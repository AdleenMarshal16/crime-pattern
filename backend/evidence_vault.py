"""
Secure Evidence Vault: SHA-256 hashing and memory-safe file storage.
"""
import os
import hashlib
import shutil
from fastapi import UploadFile

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

CHUNK_SIZE = 8192  # 8KB chunks for memory-safe streaming


def hash_and_store(upload_file: UploadFile) -> str:
    """
    Stream an uploaded file to disk using shutil.copyfileobj,
    compute its SHA-256 hash, and rename to {hash}.{ext}.

    Returns the SHA-256 hash string.
    """
    # Get original file extension
    original_name = upload_file.filename or "evidence"
    ext = os.path.splitext(original_name)[1] if "." in original_name else ""

    # First, stream to a temporary file while computing hash
    temp_path = os.path.join(UPLOAD_DIR, f"_temp_{original_name}")
    sha256 = hashlib.sha256()

    try:
        with open(temp_path, "wb") as tmp_file:
            # Use shutil.copyfileobj for memory-safe streaming
            # We wrap to also compute hash during streaming
            while True:
                chunk = upload_file.file.read(CHUNK_SIZE)
                if not chunk:
                    break
                sha256.update(chunk)
                tmp_file.write(chunk)

        file_hash = sha256.hexdigest()
        final_path = os.path.join(UPLOAD_DIR, f"{file_hash}{ext}")

        # Rename temp file to hash-named file
        if os.path.exists(final_path):
            os.remove(temp_path)  # File already exists with same hash
        else:
            shutil.move(temp_path, final_path)

        return file_hash

    except Exception:
        # Clean up temp file on error
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise


def get_evidence_path(file_hash: str) -> str | None:
    """
    Retrieve the full path of an evidence file by its SHA-256 hash.
    Returns None if not found.
    """
    for filename in os.listdir(UPLOAD_DIR):
        if filename.startswith(file_hash):
            return os.path.join(UPLOAD_DIR, filename)
    return None
