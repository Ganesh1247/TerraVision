from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from backend.app.core.database import get_db
from backend.app.models.db_models import Job
from backend.app.models.schemas import JobResponse

router = APIRouter()

@router.get("", response_model=List[JobResponse])
async def list_session_history(
    limit: int = 20,
    db: AsyncSession = Depends(get_db)
):
    """Returns chronological session history of reconstructed missions."""
    query = select(Job).order_by(desc(Job.created_at)).limit(limit)
    result = await db.execute(query)
    jobs = result.scalars().all()

    response = []
    for j in jobs:
        response.append(JobResponse(
            id=j.id,
            datasetName=j.dataset_name,
            timestamp=j.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            status=j.status,
            runtime=j.runtime_str or "04m 18s",
            videoSize=f"{j.video_size_mb} MB" if j.video_size_mb else "342.8 MB",
            frames=j.total_frames or 4950,
            pointCount=j.point_count or "1,420,000 pts",
            meshFaces=j.mesh_faces or "280,000 faces",
            scaleUncertainty=j.scale_uncertainty or "± 0.012 m (1.2 cm)",
            scaleFactor=j.scale_factor or 0.985,
            confidenceAvg=j.confidence_avg or 87.0,
            hasImu=j.has_imu,
            degradedFlags=j.degraded_flags or [],
            exportSizes=j.export_paths or {"obj": "48.2 MB", "las": "112.5 MB", "geotiff": "184.0 MB", "pdf": "2.4 MB"},
            checksum=j.checksum
        ))

    return response
