from fastapi import APIRouter, Query, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
import os

from course_database import CourseDatabase

router = APIRouter(prefix="/api", tags=["courses"])


# -------------------------------------------------------------------------
# Dependency
# -------------------------------------------------------------------------
def get_db() -> CourseDatabase:
    return CourseDatabase(
        os.environ["SUPABASE_URL"],
        os.environ["SUPABASE_KEY"]
    )


# -------------------------------------------------------------------------
# Response Models
# -------------------------------------------------------------------------
class SectionDisplay(BaseModel):
    crn: str
    seats_available: int
    max_enrollment: int
    days: str
    start_time: str
    end_time: str
    room: str
    building: str
    professor: str
    campus: str
    schedule_type: str
    instructional_method: str
    waitlist_available: int
    waitlist_count: int
    is_open: bool
    sequence_number: str


class CourseWithSections(BaseModel):
    subject: str
    course_number: str
    subject_course: str
    course_title: str
    credits: str
    credit_hours: Optional[float]
    credit_hour_low: Optional[float]
    credit_hour_high: Optional[float]
    subject_description: str
    sections: list[SectionDisplay]


class CourseListItem(BaseModel):
    subject: str
    course_number: str
    subject_course: str
    course_title: str
    credits: str
    subject_description: Optional[str] = ""
    section_count: int
    open_section_count: int


class Term(BaseModel):
    term: str
    term_description: Optional[str]


class Subject(BaseModel):
    subject: str
    subject_description: Optional[str] = None


class CodeDescription(BaseModel):
    code: str
    description: str


# -------------------------------------------------------------------------
# Metadata Endpoints
# -------------------------------------------------------------------------
@router.get("/terms", response_model=list[Term])
def get_terms(db: CourseDatabase = Depends(get_db)):
    """Get all available terms."""
    return db.get_terms()


@router.get("/terms/{term}/subjects", response_model=list[Subject])
def get_subjects(term: str, db: CourseDatabase = Depends(get_db)):
    """Get all subjects for a term."""
    return db.get_subjects(term)


@router.get("/terms/{term}/instructional-methods", response_model=list[CodeDescription])
def get_instructional_methods(term: str, db: CourseDatabase = Depends(get_db)):
    """Get instructional methods for a term (Online, In Person, etc.)."""
    return db.get_instructional_methods(term)


@router.get("/terms/{term}/campuses", response_model=list[CodeDescription])
def get_campuses(term: str, db: CourseDatabase = Depends(get_db)):
    """Get campuses for a term."""
    return db.get_campuses(term)


# -------------------------------------------------------------------------
# Course Endpoints
# -------------------------------------------------------------------------
@router.get("/terms/{term}/courses", response_model=list[CourseListItem])
def get_courses(
    term: str,
    subject: Optional[str] = Query(None, description="Filter by subject (e.g., CS)"),
    is_open: Optional[bool] = Query(None, description="Filter by open sections only"),
    limit: int = Query(50, ge=1, le=200),
    db: CourseDatabase = Depends(get_db)
):
    """Get list of courses for catalog browsing."""
    return db.get_courses_list(term, subject=subject, is_open=is_open, limit=limit)


# NOTE: /search must come before /{subject} to avoid "search" being treated as a subject
@router.get("/terms/{term}/courses/search", response_model=list[CourseListItem])
def search_courses(
    term: str,
    q: str = Query(..., min_length=1, description="Search query"),
    is_open: Optional[bool] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    db: CourseDatabase = Depends(get_db)
):
    """Search courses by title, subject, or course number."""
    return db.search_courses(term, q, is_open=is_open, limit=limit)


@router.get("/terms/{term}/courses/{subject}/{course_number}", response_model=CourseWithSections)
def get_course(
    term: str,
    subject: str,
    course_number: str,
    db: CourseDatabase = Depends(get_db)
):
    """Get a single course with all its sections."""
    course = db.get_course_with_sections(term, subject.upper(), course_number)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


# -------------------------------------------------------------------------
# Section Endpoints
# -------------------------------------------------------------------------
# NOTE: /search must come before /{crn} to avoid "search" being treated as a CRN

@router.get("/terms/{term}/sections/search", response_model=list[dict])
def search_sections(
    term: str,
    subject: Optional[str] = Query(None),
    course_number: Optional[str] = Query(None),
    title: Optional[str] = Query(None, description="Search in course title"),
    is_open: Optional[bool] = Query(None),
    limit: int = Query(100, ge=1, le=500),
    db: CourseDatabase = Depends(get_db)
):
    """Search sections with filters. Returns raw section data."""
    return db.search_sections(
        term,
        subject=subject,
        course_number=course_number,
        title_search=title,
        is_open=is_open,
        limit=limit
    )


@router.get("/terms/{term}/sections/{crn}", response_model=SectionDisplay)
def get_section(
    term: str,
    crn: str,
    db: CourseDatabase = Depends(get_db)
):
    """Get display info for a single section by CRN."""
    info = db.get_display_info(crn, term)
    if not info:
        raise HTTPException(status_code=404, detail="Section not found")
    return info


@router.get("/terms/{term}/sections", response_model=list[SectionDisplay])
def get_sections(
    term: str,
    crns: str = Query(..., description="Comma-separated CRNs"),
    db: CourseDatabase = Depends(get_db)
):
    """Get display info for multiple sections by CRN."""
    crn_list = [c.strip() for c in crns.split(",") if c.strip()]
    if not crn_list:
        raise HTTPException(status_code=400, detail="No CRNs provided")
    return db.get_display_info_batch(crn_list, term)


# -------------------------------------------------------------------------
# Faculty Endpoints
# -------------------------------------------------------------------------
@router.get("/terms/{term}/faculty/search")
def search_faculty(
    term: str,
    name: str = Query(..., min_length=1),
    db: CourseDatabase = Depends(get_db)
):
    """Search sections by faculty name."""
    return db.search_faculty(name, term)


@router.get("/terms/{term}/faculty/{name}/sections", response_model=list[SectionDisplay])
def get_faculty_sections(
    term: str,
    name: str,
    db: CourseDatabase = Depends(get_db)
):
    """Get all sections taught by a professor."""
    return db.search_sections_by_professor(term, name)


# -------------------------------------------------------------------------
# Schedule Generation
# -------------------------------------------------------------------------
class SelectedCourseRequest(BaseModel):
    subject: str
    course_number: str
    course_title: str = ""
    credits: str = "0"
    section_crns: list[str] = []


class FilterRequest(BaseModel):
    showOpenOnly: bool = True
    startTimeAfter: Optional[str] = None
    endTimeBefore: Optional[str] = None
    excludeDays: list[str] = []
    campusFilter: list[str] = []
    instructionalMethod: list[str] = []
    professorSearch: str = ""
    minSeatsAvailable: int = 0


class GenerateRequest(BaseModel):
    courses: list[SelectedCourseRequest]
    filters: FilterRequest = FilterRequest()
    max_schedules: int = 500


class CourseDetail(BaseModel):
    subject: str
    course_number: str
    course_title: str
    credits: str


class GeneratedScheduleResponse(BaseModel):
    id: int
    sections: list[SectionDisplay]
    courseDetails: list[CourseDetail]
    totalCredits: float
    earliestStart: str
    latestEnd: str
    daysOnCampus: list[str]


@router.post("/terms/{term}/generate-schedules", response_model=list[GeneratedScheduleResponse])
def generate_schedules(
    term: str,
    request: GenerateRequest,
    db: CourseDatabase = Depends(get_db)
):
    """Generate conflict-free schedule combinations."""
    course_dicts = [c.model_dump() for c in request.courses]
    filter_dict = request.filters.model_dump()
    return db.generate_schedules(term, course_dicts, filter_dict, request.max_schedules)


# -------------------------------------------------------------------------
# Raw Data Endpoints
# -------------------------------------------------------------------------
@router.get("/terms/{term}/sections/{crn}/raw")
def get_section_raw(
    term: str,
    crn: str,
    db: CourseDatabase = Depends(get_db)
):
    """Get raw section data from database."""
    data = db.get_section(crn, term)
    if not data:
        raise HTTPException(status_code=404, detail="Section not found")
    return data