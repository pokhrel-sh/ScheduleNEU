from fastapi import APIRouter, Query, Depends, HTTPException
from app.dependencies import get_repository
from app.db.repository import CourseRepository
from app.models.responses import SectionDisplay
from app.services.formatting import to_section_display

router = APIRouter(prefix="/terms/{term}/sections", tags=["sections"])


@router.get("/search", response_model=list[dict])
async def search_sections(
    term: str,
    subject: str | None = Query(None),
    course_number: str | None = Query(None),
    title: str | None = Query(None, description="Search in course title"),
    is_open: bool | None = Query(None),
    limit: int = Query(100, ge=1, le=500),
    repo: CourseRepository = Depends(get_repository),
):
    """Search sections with filters. Returns raw section data."""
    return await repo.search_sections(
        term,
        subject=subject,
        course_number=course_number,
        title_search=title,
        is_open=is_open,
        limit=limit,
    )


@router.get("/{crn}", response_model=SectionDisplay)
async def get_section(
    term: str,
    crn: str,
    repo: CourseRepository = Depends(get_repository),
):
    """Get display info for a single section by CRN."""
    row = await repo.get_section(crn, term)
    if not row:
        raise HTTPException(status_code=404, detail="Section not found")
    return to_section_display(row)


@router.get("", response_model=list[SectionDisplay])
async def get_sections_batch(
    term: str,
    crns: str = Query(..., description="Comma-separated CRNs"),
    repo: CourseRepository = Depends(get_repository),
):
    """Get display info for multiple sections by CRN."""
    crn_list = [c.strip() for c in crns.split(",") if c.strip()]
    if not crn_list:
        raise HTTPException(status_code=400, detail="No CRNs provided")
    rows = await repo.get_sections_by_crns(crn_list, term)
    return [to_section_display(r) for r in rows]


@router.get("/{crn}/raw")
async def get_section_raw(
    term: str,
    crn: str,
    repo: CourseRepository = Depends(get_repository),
):
    """Get raw section data from database."""
    data = await repo.get_section(crn, term)
    if not data:
        raise HTTPException(status_code=404, detail="Section not found")
    return data