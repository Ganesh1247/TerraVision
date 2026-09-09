import hashlib
from pathlib import Path
from typing import Union

def compute_sha256(file_path_or_bytes: Union[str, Path, bytes]) -> str:
    """Computes SHA-256 hash for raw file path or bytes buffer."""
    sha = hashlib.sha256()
    
    if isinstance(file_path_or_bytes, (str, Path)):
        p = Path(file_path_or_bytes)
        if not p.exists() or not p.is_file():
            raise FileNotFoundError(f"File not found for checksum calculation: {p}")
        with open(p, "rb") as f:
            for chunk in iter(lambda: f.read(65536), b""):
                sha.update(chunk)
    elif isinstance(file_path_or_bytes, bytes):
        sha.update(file_path_or_bytes)
    else:
        raise TypeError("Input must be a file path or bytes buffer.")
        
    return sha.hexdigest()

def verify_file_checksum(file_path: Union[str, Path], expected_hash: str) -> bool:
    """Validates if file matches the expected SHA-256 hash."""
    actual_hash = compute_sha256(file_path)
    return actual_hash.lower() == expected_hash.strip().lower()
