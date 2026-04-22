from fastapi import APIRouter, Query, Depends
from app.dependencies import get_repository
from app.db.repository import CourseRepository
from app.models.responses import SectionDisplay
from app.services.formatting import to_section_display

router = APIRouter(prefix="/terms/{term}/faculty", tags=["faculty"])


@router.get("/search")
async def search_faculty(
    term: str,
    name: str = Query(..., min_length=1),
    repo: CourseRepository = Depends(get_repository),
):
    """Search sections by faculty name."""
    return await repo.search_faculty(name, term)


@router.get("/{name}/sections", response_model=list[SectionDisplay])
async def get_faculty_sections(
    term: str,
    name: str,
    repo: CourseRepository = Depends(get_repository),
):
    """Get all sections taught by a professor."""
    rows = await repo.search_faculty(name, term)
    return [to_section_display(r) for r in rows]