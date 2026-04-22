from pydantic import BaseModel, Field


class SelectedCourseRequest(BaseModel):
    subject: str
    course_number: str
    course_title: str = ""
    credits: str = "0"
    section_crns: list[str] = Field(default_factory=list)


class ScheduleFilters(BaseModel):
    showOpenOnly: bool = True
    startTimeAfter: str | None = None
    endTimeBefore: str | None = None
    excludeDays: list[str] = Field(default_factory=list)
    campusFilter: list[str] = Field(default_factory=list)
    instructionalMethod: list[str] = Field(default_factory=list)
    professorSearch: str = ""
    minSeatsAvailable: int = 0


class GenerateSchedulesRequest(BaseModel):
    courses: list[SelectedCourseRequest]
    filters: ScheduleFilters = Field(default_factory=ScheduleFilters)
    max_schedules: int = Field(default=500, ge=1, le=1000)