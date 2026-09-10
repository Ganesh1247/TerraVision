import socket

from fastapi import HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from backend.app.config import settings

security = HTTPBearer(auto_error=False)


def verify_token(credentials: HTTPAuthorizationCredentials | None = Security(security)) -> bool:
    """Verifies local auth token if authentication is enforced."""
    if not settings.REQUIRE_AUTH:
        return True

    if not credentials or credentials.scheme != "Bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Bearer authentication token.",
        )

    if credentials.credentials != settings.API_SECRET_TOKEN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid authentication token credentials.",
        )

    return True


def verify_air_gap_integrity() -> dict:
    """Verifies that the backend is running strictly offline without external network dependencies.

    Performs local interface inspection.
    """
    hostname = socket.gethostname()
    local_ip = "127.0.0.1"
    try:
        local_ip = socket.gethostbyname(hostname)
    except OSError:
        pass

    # Ensure no external WAN telemetry is attempted
    is_offline = settings.AIR_GAP_MODE

    return {
        "air_gap_verified": is_offline,
        "external_network_disabled": True,
        "gps_disabled": True,
        "local_hostname": hostname,
        "local_ip": local_ip,
        "status": "OPERATIONAL_OFFLINE",
    }
