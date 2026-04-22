from app.db.repository import CourseRepository

_repository: CourseRepository | None = None


def get_repository() -> CourseRepository:
    """Dependency for getting repository instance."""
    global _repository
    if _repository is None:
        _repository = CourseRepository()
    return _repository