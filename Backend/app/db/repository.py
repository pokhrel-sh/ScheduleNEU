import re
import asyncio
from functools import partial
from supabase import Client
from app.db.client import get_supabase_client
from app.services.formatting import to_section_display, format_credits


class CourseRepository:
    """Async repository for course database operations."""

    def __init__(self):
        self._client: Client = get_supabase_client()

    async def _run_sync(self, func, *args, **kwargs):
        """Run sync Supabase calls in thread pool."""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, partial(func, *args, **kwargs))

    # -------------------------------------------------------------------------
    # Section Operations
    # -------------------------------------------------------------------------
    async def get_section(self, crn: str, term: str) -> dict | None:
        """Get raw section data by CRN."""
        def query():
            return (self._client.table("courses")
                    .select("*")
                    .eq("crn", crn)
                    .eq("term", term)
                    .limit(1)
                    .execute())
        res = await self._run_sync(query)
        return res.data[0] if res.data else None

    async def get_sections(
        self, term: str, subject: str | None = None,
        course_number: str | None = None, is_open: bool | None = None,
        limit: int = 100, offset: int = 0
    ) -> list[dict]:
        """Get raw section rows with optional filters."""
        def query():
            q = self._client.table("courses").select("*").eq("term", term)
            if subject:
                q = q.eq("subject", subject)
            if course_number:
                q = q.eq("course_number", course_number)
            if is_open is not None:
                q = q.eq("is_open", is_open)
            return q.range(offset, offset + limit - 1).execute()
        res = await self._run_sync(query)
        return res.data

    async def get_sections_by_crns(self, crns: list[str], term: str) -> list[dict]:
        """Get raw sections for multiple CRNs."""
        if not crns:
            return []
        def query():
            return (self._client.table("courses")
                    .select("*")
                    .eq("term", term)
                    .in_("crn", crns)
                    .execute())
        res = await self._run_sync(query)
        return res.data

    # -------------------------------------------------------------------------
    # Course Operations
    # -------------------------------------------------------------------------
    async def get_course_with_sections(
        self, term: str, subject: str, course_number: str
    ) -> dict | None:
        """Get course info with all its sections."""
        sections = await self.get_sections(term, subject=subject, course_number=course_number)
        if not sections:
            return None
        first = sections[0]
        return {
            "subject": first["subject"],
            "course_number": first["course_number"],
            "subject_course": f"{first['subject']}{first['course_number']}",
            "course_title": first["course_title"],
            "credits": format_credits(first),
            "credit_hours": first.get("credit_hours"),
            "credit_hour_low": first.get("credit_hour_low"),
            "credit_hour_high": first.get("credit_hour_high"),
            "subject_description": first.get("subject_description", ""),
            "sections": [to_section_display(s) for s in sections],
        }

    async def get_courses_list(
        self, term: str, subject: str | None = None,
        is_open: bool | None = None, limit: int = 50
    ) -> list[dict]:
        """Get unique courses with section counts."""
        def query():
            q = self._client.table("courses").select("*").eq("term", term)
            if subject:
                q = q.eq("subject", subject)
            if is_open is not None:
                q = q.eq("is_open", is_open)
            return q.execute()
        res = await self._run_sync(query)
        return self._group_to_course_list(res.data, limit)

    def _group_to_course_list(self, sections: list[dict], limit: int = 50) -> list[dict]:
        """Group section rows into course list items."""
        courses = {}
        for s in sections:
            key = f"{s['subject']}_{s['course_number']}"
            if key not in courses:
                courses[key] = {
                    "subject": s["subject"],
                    "course_number": s["course_number"],
                    "subject_course": f"{s['subject']}{s['course_number']}",
                    "course_title": s["course_title"],
                    "credits": format_credits(s),
                    "subject_description": s.get("subject_description", ""),
                    "section_count": 0,
                    "open_section_count": 0,
                }
            courses[key]["section_count"] += 1
            if s.get("is_open"):
                courses[key]["open_section_count"] += 1
        result = sorted(courses.values(), key=lambda x: (x["subject"], x["course_number"]))
        return result[:limit]

    # -------------------------------------------------------------------------
    # Search Operations
    # -------------------------------------------------------------------------
    async def search_sections(
        self, term: str, subject: str | None = None,
        course_number: str | None = None, title_search: str | None = None,
        is_open: bool | None = None, limit: int = 100
    ) -> list[dict]:
        """Search sections with filters."""
        def query():
            q = self._client.table("courses").select("*").eq("term", term)
            if subject:
                q = q.eq("subject", subject)
            if course_number:
                q = q.eq("course_number", course_number)
            if title_search:
                q = q.ilike("course_title", f"%{title_search}%")
            if is_open is not None:
                q = q.eq("is_open", is_open)
            return q.limit(limit).execute()
        res = await self._run_sync(query)
        return res.data

    async def search_courses(
        self, term: str, query_str: str,
        is_open: bool | None = None, limit: int = 50
    ) -> list[dict]:
        """Smart search for courses."""
        query_str = query_str.strip().upper()

        # Subject + course number pattern
        match = re.match(r"^([A-Z]{2,4})\s*(\d{1,4})$", query_str)
        if match:
            subject, num_part = match.groups()
            def query():
                q = self._client.table("courses").select("*").eq("term", term).eq("subject", subject)
                if len(num_part) == 4:
                    q = q.eq("course_number", num_part)
                else:
                    q = q.like("course_number", f"{num_part}%")
                return q.execute()
            res = await self._run_sync(query)
            return self._group_to_course_list(
                [s for s in res.data if is_open is None or s.get("is_open") == is_open],
                limit
            )

        # Just subject code
        if re.match(r"^[A-Z]{2,4}$", query_str):
            return await self.get_courses_list(term, subject=query_str, is_open=is_open, limit=limit)

        # Course number or title search
        if re.match(r"^\d{1,4}$", query_str):
            def query():
                q = self._client.table("courses").select("*").eq("term", term)
                if len(query_str) == 4:
                    q = q.eq("course_number", query_str)
                else:
                    q = q.like("course_number", f"{query_str}%")
                return q.execute()
        else:
            def query():
                return (self._client.table("courses")
                        .select("*")
                        .eq("term", term)
                        .ilike("course_title", f"%{query_str}%")
                        .execute())
        res = await self._run_sync(query)
        return self._group_to_course_list(
            [s for s in res.data if is_open is None or s.get("is_open") == is_open],
            limit
        )

    async def search_faculty(self, name: str, term: str | None = None) -> list[dict]:
        """Search sections by faculty name."""
        def query():
            q = self._client.table("courses").select("*")
            if term:
                q = q.eq("term", term)
            return q.execute()
        res = await self._run_sync(query)
        name_lower = name.lower()
        results = []
        for row in res.data:
            for f in row.get("faculty", []):
                if f.get("name") and name_lower in f["name"].lower():
                    results.append(row)
                    break
        return results

    # -------------------------------------------------------------------------
    # Metadata Operations
    # -------------------------------------------------------------------------
    async def get_terms(self) -> list[dict]:
        """Get all available terms."""
        def query():
            return self._client.rpc("get_distinct_terms").execute()
        res = await self._run_sync(query)
        return res.data

    async def get_subjects(self, term: str) -> list[dict]:
        """Get all subjects for a term."""
        def query():
            return (self._client.table("courses")
                    .select("subject, subject_description")
                    .eq("term", term)
                    .limit(10000)
                    .execute())
        res = await self._run_sync(query)
        seen = {}
        for r in res.data:
            subj = r.get("subject")
            if subj and subj not in seen:
                seen[subj] = r.get("subject_description", "")
        return [{"subject": k, "subject_description": v} for k, v in sorted(seen.items())]

    async def get_instructional_methods(self, term: str) -> list[dict]:
        """Get instructional methods for a term."""
        def query():
            return (self._client.table("courses")
                    .select("instructional_method, instructional_method_description")
                    .eq("term", term)
                    .limit(10000)
                    .execute())
        res = await self._run_sync(query)
        seen = {}
        for r in res.data:
            method = r.get("instructional_method")
            if method and method not in seen:
                seen[method] = r.get("instructional_method_description", method)
        return [{"code": k, "description": v} for k, v in sorted(seen.items())]

    async def get_campuses(self, term: str) -> list[dict]:
        """Get campuses for a term."""
        def query():
            return (self._client.table("courses")
                    .select("campus, campus_description")
                    .eq("term", term)
                    .limit(10000)
                    .execute())
        res = await self._run_sync(query)
        seen = {}
        for r in res.data:
            campus = r.get("campus")
            if campus and campus not in seen:
                seen[campus] = r.get("campus_description", campus)
        return [{"code": k, "description": v} for k, v in sorted(seen.items())]