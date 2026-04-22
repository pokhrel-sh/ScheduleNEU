from fastapi import APIRouter, Query, Depends, HTTPException
from app.dependencies import get_repository
from app.db.repository import CourseRepository
from app.models.responses import CourseListItem, CourseWithSections

router = APIRouter(prefix="/terms/{term}/courses", tags=["courses"])


@router.get("", response_model=list[CourseListItem])
async def get_courses(
    term: str,
    subject: str | None = Query(None, description="Filter by subject (e.g., CS)"),
    is_open: bool | None = Query(None, description="Filter by open sections only"),
    limit: int = Query(50, ge=1, le=200),
    repo: CourseRepository = Depends(get_repository),
):
    """Get list of courses for catalog browsing."""
    return await repo.get_courses_list(term, subject=subject, is_open=is_open, limit=limit)


@router.get("/search", response_model=list[CourseListItem])
async def search_courses(
    term: str,
    q: str = Query(..., min_length=1, description="Search query"),
    is_open: bool | None = Query(None),
    limit: int = Query(50, ge=1, le=200),
    repo: CourseRepository = Depends(get_repository),
):
    """Search courses by title, subject, or course number."""
    return await repo.search_courses(term, q, is_open=is_open, limit=limit)


@router.get("/{subject}/{course_number}", response_model=CourseWithSections)
async def get_course(
    term: str,
    subject: str,
    course_number: str,
    repo: CourseRepository = Depends(get_repository),
):
    """Get a single course with all its sections."""
    course = await repo.get_course_with_sections(term, subject.upper(), course_number)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course