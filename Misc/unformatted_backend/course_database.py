from supabase import create_client, Client
from typing import Optional


class CourseDatabase:
    def __init__(self, url: str, key: str):
        self.client: Client = create_client(url, key)

    # -------------------------------------------------------------------------
    # Helpers
    # -------------------------------------------------------------------------
    def _format_time(self, time_str: Optional[str]) -> str:
        """Convert 24h time to 12h format."""
        if not time_str:
            return ""
        try:
            h, m = time_str.split(":")[:2]
            hour = int(h)
            suffix = "am" if hour < 12 else "pm"
            if hour > 12:
                hour -= 12
            elif hour == 0:
                hour = 12
            return f"{hour}:{m}{suffix}"
        except:
            return time_str

    def _format_credits(self, row: dict) -> str:
        """Format credit hours, handling variable credit courses."""
        if row.get("credit_hours"):
            c = row["credit_hours"]
            return str(int(c)) if c == int(c) else str(c)
        low, high = row.get("credit_hour_low"), row.get("credit_hour_high")
        if low and high and low != high:
            return f"{int(low)}-{int(high)}"
        elif low:
            return str(int(low))
        return "TBA"

    def _get_primary_professor(self, faculty: list) -> str:
        """Extract primary professor name from faculty JSONB array."""
        if not faculty:
            return "TBA"
        primary = next((f for f in faculty if f.get("is_primary")), None)
        return primary["name"] if primary else faculty[0].get("name", "TBA")

    def _get_meeting_info(self, meetings: list) -> dict:
        """Extract first meeting's info from meetings JSONB array."""
        if not meetings:
            return {"days": "TBA", "start_time": "", "end_time": "", "room": "TBA", "building": ""}
        m = meetings[0]
        return {
            "days": m.get("days", "TBA"),
            "start_time": self._format_time(m.get("start_time")),
            "end_time": self._format_time(m.get("end_time")),
            "room": m.get("room") or "TBA",
            "building": m.get("building_description") or m.get("building") or "",
        }

    def _to_display_info(self, row: dict) -> dict:
        """Convert a database row to display format."""
        meeting = self._get_meeting_info(row.get("meetings", []))
        return {
            "crn": row["crn"],
            "seats_available": row.get("seats_available", 0),
            "max_enrollment": row.get("maximum_enrollment", 0),
            "days": meeting["days"],
            "start_time": meeting["start_time"],
            "end_time": meeting["end_time"],
            "room": meeting["room"],
            "building": meeting["building"],
            "professor": self._get_primary_professor(row.get("faculty", [])),
            "campus": row.get("campus_description", ""),
            "schedule_type": row.get("schedule_type_description", ""),
            "instructional_method": row.get("instructional_method_description", ""),
            "waitlist_available": row.get("wait_available", 0),
            "waitlist_count": row.get("wait_count", 0),
            "is_open": row.get("is_open", False),
            "sequence_number": row.get("sequence_number", ""),
        }

    # -------------------------------------------------------------------------
    # Single Section Access
    # -------------------------------------------------------------------------
    def get_section(self, crn: str, term: str) -> Optional[dict]:
        """Get raw section data by CRN."""
        res = (self.client.table("courses")
               .select("*")
               .eq("crn", crn)
               .eq("term", term)
               .limit(1)
               .execute())
        return res.data[0] if res.data else None

    def get_display_info(self, crn: str, term: str) -> Optional[dict]:
        """Get formatted display info for a single section."""
        row = self.get_section(crn, term)
        return self._to_display_info(row) if row else None

    # -------------------------------------------------------------------------
    # Multiple Sections Access
    # -------------------------------------------------------------------------
    def get_sections(self, term: str, subject: Optional[str] = None,
                     course_number: Optional[str] = None,
                     is_open: Optional[bool] = None,
                     limit: int = 100, offset: int = 0) -> list[dict]:
        """Get raw section rows with optional filters."""
        q = self.client.table("courses").select("*").eq("term", term)
        if subject:
            q = q.eq("subject", subject)
        if course_number:
            q = q.eq("course_number", course_number)
        if is_open is not None:
            q = q.eq("is_open", is_open)
        return q.range(offset, offset + limit - 1).execute().data

    def get_sections_by_crns(self, crns: list[str], term: str) -> list[dict]:
        """Get raw sections for multiple CRNs."""
        if not crns:
            return []
        return (self.client.table("courses")
                .select("*")
                .eq("term", term)
                .in_("crn", crns)
                .execute()).data

    def get_display_info_batch(self, crns: list[str], term: str) -> list[dict]:
        """Get formatted display info for multiple CRNs."""
        rows = self.get_sections_by_crns(crns, term)
        return [self._to_display_info(r) for r in rows]

    # -------------------------------------------------------------------------
    # Course-Level Access (grouped sections)
    # -------------------------------------------------------------------------
    def get_course_with_sections(self, term: str, subject: str, course_number: str) -> Optional[dict]:
        """Get course info + all its sections."""
        sections = self.get_sections(term, subject=subject, course_number=course_number)
        if not sections:
            return None
        
        first = sections[0]
        return {
            "subject": first["subject"],
            "course_number": first["course_number"],
            "subject_course": f"{first['subject']}{first['course_number']}",
            "course_title": first["course_title"],
            "credits": self._format_credits(first),
            "credit_hours": first.get("credit_hours"),
            "credit_hour_low": first.get("credit_hour_low"),
            "credit_hour_high": first.get("credit_hour_high"),
            "subject_description": first.get("subject_description", ""),
            "sections": [self._to_display_info(s) for s in sections]
        }

    def get_courses_list(self, term: str, subject: Optional[str] = None,
                         is_open: Optional[bool] = None, limit: int = 50) -> list[dict]:
        """Get unique courses with section counts (for catalog browsing)."""
        q = self.client.table("courses").select("*").eq("term", term)
        if subject:
            q = q.eq("subject", subject)
        if is_open is not None:
            q = q.eq("is_open", is_open)
        
        sections = q.execute().data
        
        # Group by course
        courses = {}
        for s in sections:
            key = f"{s['subject']}_{s['course_number']}"
            if key not in courses:
                courses[key] = {
                    "subject": s["subject"],
                    "course_number": s["course_number"],
                    "subject_course": f"{s['subject']}{s['course_number']}",
                    "course_title": s["course_title"],
                    "credits": self._format_credits(s),
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
    # Search
    # -------------------------------------------------------------------------
    def search_sections(self, term: str, subject: Optional[str] = None,
                        course_number: Optional[str] = None,
                        title_search: Optional[str] = None,
                        is_open: Optional[bool] = None,
                        limit: int = 100) -> list[dict]:
        """Search sections with filters, returns raw rows."""
        q = self.client.table("courses").select("*").eq("term", term)
        if subject:
            q = q.eq("subject", subject)
        if course_number:
            q = q.eq("course_number", course_number)
        if title_search:
            q = q.ilike("course_title", f"%{title_search}%")
        if is_open is not None:
            q = q.eq("is_open", is_open)
        return q.limit(limit).execute().data

    def _group_sections_to_courses(self, sections: list[dict], is_open: Optional[bool] = None,
                                    limit: int = 50) -> list[dict]:
        """Group raw section rows into CourseListItem format."""
        if is_open is not None:
            sections = [s for s in sections if s.get("is_open") == is_open]
        courses = {}
        for s in sections:
            key = f"{s['subject']}_{s['course_number']}"
            if key not in courses:
                courses[key] = {
                    "subject": s["subject"],
                    "course_number": s["course_number"],
                    "subject_course": f"{s['subject']}{s['course_number']}",
                    "course_title": s["course_title"],
                    "credits": self._format_credits(s),
                    "subject_description": s.get("subject_description", ""),
                    "section_count": 0,
                    "open_section_count": 0,
                }
            courses[key]["section_count"] += 1
            if s.get("is_open"):
                courses[key]["open_section_count"] += 1
        return sorted(courses.values(), key=lambda x: (x["subject"], x["course_number"]))[:limit]

    def search_courses(self, term: str, query: str, is_open: Optional[bool] = None,
                       limit: int = 50) -> list[dict]:
        """Smart search: handles 'CS4550', 'CS 4550', 'CS 12', 'CS', '4550', or 'web development'."""
        import re
        query = query.strip().upper()

        # Subject + course number, full or partial (e.g., "CS4550", "CS 4550", "CS 12")
        match = re.match(r'^([A-Z]{2,4})\s*(\d{1,4})$', query)
        if match:
            subject, num_part = match.groups()
            q = self.client.table("courses").select("*").eq("term", term).eq("subject", subject)
            if len(num_part) == 4:
                q = q.eq("course_number", num_part)
            else:
                q = q.like("course_number", f"{num_part}%")
            sections = q.execute().data
            return self._group_sections_to_courses(sections, is_open=is_open, limit=limit)

        # Just subject code (e.g., "CS")
        if re.match(r'^[A-Z]{2,4}$', query):
            return self.get_courses_list(term, subject=query, is_open=is_open, limit=limit)

        # Just course number (e.g., "4550" or partial "45")
        if re.match(r'^\d{1,4}$', query):
            q = self.client.table("courses").select("*").eq("term", term)
            if len(query) == 4:
                q = q.eq("course_number", query)
            else:
                q = q.like("course_number", f"{query}%")
            sections = q.execute().data
        else:
            # Title search
            sections = (self.client.table("courses")
                       .select("*")
                       .eq("term", term)
                       .ilike("course_title", f"%{query}%")
                       .execute()).data

        return self._group_sections_to_courses(sections, is_open=is_open, limit=limit)

    def search_faculty(self, name: str, term: Optional[str] = None) -> list[dict]:
        """Search sections by faculty name (searches inside JSONB)."""
        q = self.client.table("courses").select("*")
        if term:
            q = q.eq("term", term)
        rows = q.execute().data
        
        name_lower = name.lower()
        results = []
        for row in rows:
            faculty = row.get("faculty", [])
            for f in faculty:
                if f.get("name") and name_lower in f["name"].lower():
                    results.append(row)
                    break
        return results

    def search_sections_by_professor(self, term: str, professor_name: str) -> list[dict]:
        """Find all sections taught by a professor."""
        rows = self.search_faculty(professor_name, term)
        return [self._to_display_info(r) for r in rows]

    # -------------------------------------------------------------------------
    # Metadata
    # -------------------------------------------------------------------------
    def get_terms(self) -> list[dict]:
        """Get all available terms."""
        res = self.client.rpc("get_distinct_terms").execute()
        return res.data

    def get_subjects(self, term: str) -> list[dict]:
        """Get all subjects for a term."""
        res = (self.client.table("courses")
               .select("subject, subject_description")
               .eq("term", term)
               .limit(10000)
               .execute())
        seen = {}
        for r in res.data:
            subj = r.get("subject")
            if subj and subj not in seen:
                seen[subj] = r.get("subject_description", "")
        return [{"subject": k, "subject_description": v} for k, v in sorted(seen.items())]

    def get_instructional_methods(self, term: str) -> list[dict]:
        """Get instructional methods for a term."""
        res = (self.client.table("courses")
               .select("instructional_method, instructional_method_description")
               .eq("term", term)
               .limit(10000)
               .execute())
        seen = {}
        for r in res.data:
            method = r.get("instructional_method")
            if method and method not in seen:
                seen[method] = r.get("instructional_method_description", method)
        return [{"code": k, "description": v} for k, v in sorted(seen.items())]

    def get_campuses(self, term: str) -> list[dict]:
        """Get campuses for a term."""
        res = (self.client.table("courses")
               .select("campus, campus_description")
               .eq("term", term)
               .limit(10000)
               .execute())
        seen = {}
        for r in res.data:
            campus = r.get("campus")
            if campus and campus not in seen:
                seen[campus] = r.get("campus_description", campus)
        return [{"code": k, "description": v} for k, v in sorted(seen.items())]


    # -------------------------------------------------------------------------
    # Schedule Generation
    # -------------------------------------------------------------------------
    @staticmethod
    def _parse_time(time_str: str) -> int:
        """Parse '1:30pm' to minutes since midnight."""
        if not time_str:
            return 0
        import re
        m = re.match(r'(\d+):(\d+)\s*(am|pm)', time_str, re.IGNORECASE)
        if not m:
            return 0
        hours = int(m.group(1))
        minutes = int(m.group(2))
        period = m.group(3).lower()
        if period == 'pm' and hours != 12:
            hours += 12
        if period == 'am' and hours == 12:
            hours = 0
        return hours * 60 + minutes

    @staticmethod
    def _expand_days(days: str) -> list[str]:
        """Expand 'MWF' to ['M','W','F']."""
        if not days:
            return []
        valid = set('MTWRFSU')
        return [d for d in days if d in valid]

    @staticmethod
    def _sort_days(days: list[str]) -> list[str]:
        order = 'MTWRFSU'
        return sorted(days, key=lambda d: order.index(d) if d in order else 99)

    @staticmethod
    def _sections_conflict(s1: dict, s2: dict) -> bool:
        """Check if two sections have overlapping time slots."""
        days1 = CourseDatabase._expand_days(s1.get("days", ""))
        days2 = CourseDatabase._expand_days(s2.get("days", ""))
        start1 = CourseDatabase._parse_time(s1.get("start_time", ""))
        end1 = CourseDatabase._parse_time(s1.get("end_time", ""))
        start2 = CourseDatabase._parse_time(s2.get("start_time", ""))
        end2 = CourseDatabase._parse_time(s2.get("end_time", ""))
        if start1 == 0 and end1 == 0:
            return False
        if start2 == 0 and end2 == 0:
            return False
        for d1 in days1:
            for d2 in days2:
                if d1 == d2:
                    if not (end1 <= start2 or end2 <= start1):
                        return True
        return False

    def _apply_section_filters(self, sections: list[dict], filters: dict) -> list[dict]:
        """Apply filter criteria to sections."""
        result = []
        for s in sections:
            if filters.get("showOpenOnly") and not s.get("is_open"):
                continue
            min_seats = filters.get("minSeatsAvailable", 0)
            if min_seats and s.get("seats_available", 0) < min_seats:
                continue
            if filters.get("startTimeAfter"):
                section_start = self._parse_time(s.get("start_time", ""))
                filter_start = self._parse_time(filters["startTimeAfter"])
                if section_start and filter_start and section_start < filter_start:
                    continue
            if filters.get("endTimeBefore"):
                section_end = self._parse_time(s.get("end_time", ""))
                filter_end = self._parse_time(filters["endTimeBefore"])
                if section_end and filter_end and section_end > filter_end:
                    continue
            exclude_days = filters.get("excludeDays", [])
            if exclude_days:
                section_days = self._expand_days(s.get("days", ""))
                if any(d in exclude_days for d in section_days):
                    continue
            campus_filter = filters.get("campusFilter", [])
            if campus_filter and s.get("campus", "") not in campus_filter:
                continue
            method_filter = filters.get("instructionalMethod", [])
            if method_filter and s.get("instructional_method", "") not in method_filter:
                continue
            prof_search = filters.get("professorSearch", "")
            if prof_search and prof_search.lower() not in s.get("professor", "").lower():
                continue
            result.append(s)
        return result

    def generate_schedules(self, term: str, course_requests: list[dict],
                           filters: dict, max_schedules: int = 500) -> list[dict]:
        """Generate conflict-free schedule combinations."""
        course_options = []
        for req in course_requests:
            crns = req.get("section_crns", [])
            if crns:
                rows = self.get_sections_by_crns(crns, term)
                sections = [self._to_display_info(r) for r in rows]
            else:
                rows = self.get_sections(term, subject=req["subject"],
                                         course_number=req["course_number"], limit=500)
                sections = [self._to_display_info(r) for r in rows]
                sections = self._apply_section_filters(sections, filters)
            if not sections:
                return []
            course_options.append({
                "course": {
                    "subject": req["subject"],
                    "course_number": req["course_number"],
                    "course_title": req.get("course_title", ""),
                    "credits": req.get("credits", "0"),
                },
                "sections": sections,
            })

        results = []
        schedule_id = [0]

        def build(idx, current):
            if len(results) >= max_schedules:
                return
            if idx == len(course_options):
                schedule_id[0] += 1
                course_details = [co["course"] for co in course_options]
                total_credits = sum(float(c.get("credits", 0) or 0) for c in course_details)
                earliest = float('inf')
                earliest_str = ""
                latest = 0
                latest_str = ""
                days_set = set()
                for s in current:
                    st = self._parse_time(s.get("start_time", ""))
                    et = self._parse_time(s.get("end_time", ""))
                    if st and st < earliest:
                        earliest = st
                        earliest_str = s["start_time"]
                    if et and et > latest:
                        latest = et
                        latest_str = s["end_time"]
                    for d in self._expand_days(s.get("days", "")):
                        days_set.add(d)
                results.append({
                    "id": schedule_id[0],
                    "sections": list(current),
                    "courseDetails": course_details,
                    "totalCredits": total_credits,
                    "earliestStart": earliest_str,
                    "latestEnd": latest_str,
                    "daysOnCampus": self._sort_days(list(days_set)),
                })
                return

            for section in course_options[idx]["sections"]:
                if not any(self._sections_conflict(s, section) for s in current):
                    current.append(section)
                    build(idx + 1, current)
                    current.pop()

        build(0, [])
        return results


# Example usage
if __name__ == "__main__":
    import os
    db = CourseDatabase(os.environ["SUPABASE_URL"], os.environ["SUPABASE_KEY"])

    # Get terms
    print("=== Terms ===")
    for t in db.get_terms()[:3]:
        print(f"  {t['term']}: {t['term_description']}")

    # Get a course with sections
    print("\n=== CS 2500 ===")
    course = db.get_course_with_sections("202510", "CS", "2500")
    if course:
        print(f"{course['subject_course']} - {course['course_title']} ({course['credits']} cr)")
        for sec in course['sections'][:3]:
            print(f"  {sec['crn']}: {sec['days']} {sec['start_time']}-{sec['end_time']} | {sec['professor']}")

    # Search
    print("\n=== Search 'programming' ===")
    results = db.search_courses("202510", "programming")
    for c in results[:5]:
        print(f"  {c['subject_course']}: {c['course_title']}")