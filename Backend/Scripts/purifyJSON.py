import json

def match_and_format(course_details, schedule_details):
    formatted_courses = []
    
    for schedule in schedule_details:
        crn_schedule = schedule.get("readonly (5)")
        
        for course in course_details:
            if course.get("crn") == crn_schedule:
                formatted_course = {
                    "term": course.get("term"),
                    "crn": crn_schedule,
                    "campus": schedule.get("readonly (7)"),
                    "scheduletype": schedule.get("expand"),
                    "section_number": course.get("section_number"),
                    "course_code": course.get("course_code"),
                    "course_number": course.get("course_number"),
                    "courseIdentification": course.get("course_code", "") + course.get("course_number", ""),
                    "title": course.get("title"),
                    "credit_hours": course.get("credit_hours"),
                    "description": course.get("description"),
                    "instructor_name": course.get("instructor_name"),
                    "time_held1": schedule.get("meeting"),
                    "day_held1": schedule.get("ui-pillbox-summary"),
                    "building": schedule.get("tooltip-row (3)"),
                    "room_number": schedule.get("tooltip-row (5)"),
                    "seats": schedule.get("readonly (8)")
                }
                
                # Adding additional meeting times if they exist
                for i in range(2, 6):
                    time_key = f"meeting ({(i-1) * 5 + 1})"
                    day_key = f"ui-pillbox-summary ({i})"
                    if time_key in schedule and day_key in schedule:
                        formatted_course[f"time_held{i}"] = schedule[time_key]
                        formatted_course[f"day_held{i}"] = schedule[day_key]
                
                formatted_courses.append(formatted_course)
    
    return formatted_courses

# Load JSON data (replace with actual file reading if needed)
with open("course_details.json") as f:
    course_details = json.load(f)

with open("schedule_details.json") as f:
    schedule_details = json.load(f)

# Process the data
formatted_data = match_and_format(course_details, schedule_details)

# Output the formatted data to a JSON file
with open("formatted_courses.json", "w") as f:
    json.dump(formatted_data, f, indent=4)

print("Formatted data saved to formatted_courses.json")
