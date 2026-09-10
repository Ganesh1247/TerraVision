"""Terra Vision Backend Launcher (SIH26158).

Runs Uvicorn server on http://127.0.0.1:8000
"""

import sys
from pathlib import Path

# Add project root to sys.path
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

import uvicorn

if __name__ == "__main__":
    print("==================================================================")
    print("  TERRA VISION — OFFLINE EDGE RECONSTRUCTION SYSTEM (SIH26158)  ")
    print("  100% Offline Air-Gapped Operation | GPS-Free VIO & SfM Engine   ")
    print("==================================================================")
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=False, log_level="info")
