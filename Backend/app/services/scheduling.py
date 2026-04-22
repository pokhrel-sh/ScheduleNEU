from app.services.formatting import (
    parse_time_to_minutes, expand_days, sort_days, to_section_display
)
from app.db.repository import CourseRepository


def sections_conflict(s1: dict, s2: dict) -> bool:
    """Check if two sections have overlapping time slots."""
    days1 = expand_days(s1.get("days", ""))
    days2 = expand_days(s2.get("days", ""))
    start1 = parse_time_to_minutes(s1.get("start_time", ""))
    end1 = parse_time_to_minutes(s1.get("end_time", ""))
    start2 = parse_time_to_minutes(s2.get("start_time", ""))
    end2 = parse_time_to_minutes(s2.get("end_time", ""))
    
    if (start1 == 0 and end1 == 0) or (start2 == 0 and end2 == 0):
        return False
    
    for d1 in days1:
        if d1 in days2 and not (end1 <= start2 or end2 <= start1):
            return True
    return False


def apply_section_filters(sections: list[dict], filters: dict) -> list[dict]:
    """Apply filter criteria to sections."""
    result = []
    for s in sections:
        if filters.get("showOpenOnly") and not s.get("is_open"):
            continue
        min_seats = filters.get("minSeatsAvailable", 0)
        if min_seats and s.get("seats_available", 0) < min_seats:
            continue
        if filters.get("startTimeAfter"):
            section_start = parse_time_to_minutes(s.get("start_time", ""))
            filter_start = parse_time_to_minutes(filters["startTimeAfter"])
            if section_start and filter_start and section_start < filter_start:
                continue
        if filters.get("endTimeBefore"):
            section_end = parse_time_to_minutes(s.get("end_time", ""))
            filter_end = parse_time_to_minutes(filters["endTimeBefore"])
            if section_end and filter_end and section_end > filter_end:
                continue
        exclude_days = filters.get("excludeDays", [])
        if exclude_days:
            section_days = expand_days(s.get("days", ""))
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


async def generate_schedules(
    repo: CourseRepository,
    term: str,
    course_requests: list[dict],
    filters: dict,
    max_schedules: int = 500
) -> list[dict]:
    """Generate conflict-free schedule combinations."""
    course_options = []
    
    for req in course_requests:
        crns = req.get("section_crns", [])
        if crns:
            rows = await repo.get_sections_by_crns(crns, term)
            sections = [to_section_display(r) for r in rows]
        else:
            rows = await repo.get_sections(
                term, subject=req["subject"],
                course_number=req["course_number"], limit=500
            )
            sections = [to_section_display(r) for r in rows]
            sections = apply_section_filters(sections, filters)
        
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

    def build(idx: int, current: list[dict]):
        if len(results) >= max_schedules:
            return
        if idx == len(course_options):
            schedule_id[0] += 1
            course_details = [co["course"] for co in course_options]
            def safe_float(val):
                try:
                    return float(val)
                except (ValueError, TypeError):
                    return 0.0
            total_credits = sum(safe_float(c.get("credits", 0)) for c in course_details)
            earliest, latest = float("inf"), 0
            earliest_str, latest_str = "", ""
            days_set = set()
            
            for s in current:
                st = parse_time_to_minutes(s.get("start_time", ""))
                et = parse_time_to_minutes(s.get("end_time", ""))
                if st and st < earliest:
                    earliest, earliest_str = st, s["start_time"]
                if et and et > latest:
                    latest, latest_str = et, s["end_time"]
                days_set.update(expand_days(s.get("days", "")))
            
            results.append({
                "id": schedule_id[0],
                "sections": list(current),
                "courseDetails": course_details,
                "totalCredits": total_credits,
                "earliestStart": earliest_str,
                "latestEnd": latest_str,
                "daysOnCampus": sort_days(list(days_set)),
            })
            return

        for section in course_options[idx]["sections"]:
            if not any(sections_conflict(s, section) for s in current):
                current.append(section)
                build(idx + 1, current)
                current.pop()

    build(0, [])
    return results