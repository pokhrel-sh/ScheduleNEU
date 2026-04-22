from fastapi import APIRouter
from app.routes import metadata, courses, sections, faculty, schedules

api_router = APIRouter(prefix="/api")

api_router.include_router(metadata.router)
api_router.include_router(courses.router)
api_router.include_router(sections.router)
api_router.include_router(faculty.router)
api_router.include_router(schedules.router)