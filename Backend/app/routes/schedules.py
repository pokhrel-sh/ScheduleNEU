from fastapi import APIRouter, Depends
from app.dependencies import get_repository
from app.db.repository import CourseRepository
from app.models.requests import GenerateSchedulesRequest
from app.models.responses import GeneratedSchedule
from app.services.scheduling import generate_schedules

router = APIRouter(prefix="/terms/{term}", tags=["schedules"])


@router.post("/generate-schedules", response_model=list[GeneratedSchedule])
async def generate_schedules_endpoint(
    term: str,
    request: GenerateSchedulesRequest,
    repo: CourseRepository = Depends(get_repository),
):
    """Generate conflict-free schedule combinations."""
    course_dicts = [c.model_dump() for c in request.courses]
    filter_dict = request.filters.model_dump()
    return await generate_schedules(
        repo, term, course_dicts, filter_dict, request.max_schedules
    )