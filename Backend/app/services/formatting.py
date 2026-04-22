import re


def format_time(time_str: str | None) -> str:
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
    except (ValueError, AttributeError):
        return time_str


def format_credits(row: dict) -> str:
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


def parse_time_to_minutes(time_str: str) -> int:
    """Parse '1:30pm' to minutes since midnight."""
    if not time_str:
        return 0
    m = re.match(r"(\d+):(\d+)\s*(am|pm)", time_str, re.IGNORECASE)
    if not m:
        return 0
    hours, minutes = int(m.group(1)), int(m.group(2))
    period = m.group(3).lower()
    if period == "pm" and hours != 12:
        hours += 12
    if period == "am" and hours == 12:
        hours = 0
    return hours * 60 + minutes


def expand_days(days: str) -> list[str]:
    """Expand 'MWF' to ['M','W','F']."""
    if not days:
        return []
    valid = set("MTWRFSU")
    return [d for d in days if d in valid]


def sort_days(days: list[str]) -> list[str]:
    """Sort days in week order."""
    order = "MTWRFSU"
    return sorted(days, key=lambda d: order.index(d) if d in order else 99)


def get_primary_professor(faculty: list | None) -> str:
    """Extract primary professor name from faculty JSONB array."""
    if not faculty:
        return "TBA"
    primary = next((f for f in faculty if f.get("is_primary")), None)
    return primary["name"] if primary else faculty[0].get("name", "TBA")


def get_meeting_info(meetings: list | None) -> dict:
    """Extract first meeting's info from meetings JSONB array."""
    if not meetings:
        return {"days": "TBA", "start_time": "", "end_time": "", "room": "TBA", "building": ""}
    m = meetings[0]
    return {
        "days": m.get("days", "TBA"),
        "start_time": format_time(m.get("start_time")),
        "end_time": format_time(m.get("end_time")),
        "room": m.get("room") or "TBA",
        "building": m.get("building_description") or m.get("building") or "",
    }


def to_section_display(row: dict) -> dict:
    """Convert a database row to display format."""
    meeting = get_meeting_info(row.get("meetings", []))
    return {
        "crn": row["crn"],
        "seats_available": row.get("seats_available", 0),
        "max_enrollment": row.get("maximum_enrollment", 0),
        "days": meeting["days"],
        "start_time": meeting["start_time"],
        "end_time": meeting["end_time"],
        "room": meeting["room"],
        "building": meeting["building"],
        "professor": get_primary_professor(row.get("faculty", [])),
        "campus": row.get("campus_description", ""),
        "schedule_type": row.get("schedule_type_description", ""),
        "instructional_method": row.get("instructional_method_description", ""),
        "waitlist_available": row.get("wait_available", 0),
        "waitlist_count": row.get("wait_count", 0),
        "is_open": row.get("is_open", False),
        "sequence_number": row.get("sequence_number", ""),
    }