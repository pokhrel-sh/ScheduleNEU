from fastapi import APIRouter, Depends
from app.dependencies import get_repository
from app.db.repository import CourseRepository
from app.models.responses import Term, Subject, CodeDescription

router = APIRouter(tags=["metadata"])


@router.get("/terms", response_model=list[Term])
async def get_terms(repo: CourseRepository = Depends(get_repository)):
    """Get all available terms."""
    return await repo.get_terms()


@router.get("/terms/{term}/subjects", response_model=list[Subject])
async def get_subjects(term: str, repo: CourseRepository = Depends(get_repository)):
    """Get all subjects for a term."""
    return await repo.get_subjects(term)


@router.get("/terms/{term}/instructional-methods", response_model=list[CodeDescription])
async def get_instructional_methods(
    term: str, repo: CourseRepository = Depends(get_repository)
):
    """Get instructional methods for a term (Online, In Person, etc.)."""
    return await repo.get_instructional_methods(term)


@router.get("/terms/{term}/campuses", response_model=list[CodeDescription])
async def get_campuses(term: str, repo: CourseRepository = Depends(get_repository)):
    """Get campuses for a term."""
    return await repo.get_campuses(term)