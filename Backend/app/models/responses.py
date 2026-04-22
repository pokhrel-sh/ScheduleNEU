from pydantic import BaseModel


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
    credit_hours: float | None
    credit_hour_low: float | None
    credit_hour_high: float | None
    subject_description: str
    sections: list[SectionDisplay]


class CourseListItem(BaseModel):
    subject: str
    course_number: str
    subject_course: str
    course_title: str
    credits: str
    subject_description: str = ""
    section_count: int
    open_section_count: int


class Term(BaseModel):
    term: str
    term_description: str | None


class Subject(BaseModel):
    subject: str
    subject_description: str | None = None


class CodeDescription(BaseModel):
    code: str
    description: str


class CourseDetail(BaseModel):
    subject: str
    course_number: str
    course_title: str
    credits: str


class GeneratedSchedule(BaseModel):
    id: int
    sections: list[SectionDisplay]
    courseDetails: list[CourseDetail]
    totalCredits: float
    earliestStart: str
    latestEnd: str
    daysOnCampus: list[str]


class HealthResponse(BaseModel):
    status: str