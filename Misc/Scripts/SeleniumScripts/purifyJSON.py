
import os
import json

def reformat_schedule(schedule_details):
    formatted_courses = []

    for schedule in schedule_details:
        formatted_course = {
            "term": None,
            "crn": schedule.get("readonly (5)"),
            "campus": schedule.get("readonly (7)"),
            "scheduletype": schedule.get("expand"),
            "section_number": schedule.get("readonly (3)"),
            "course_code": None,
            "course_number": None,
            "courseIdentification": "",
            "title": schedule.get("section-details-link"),
            "credit_hours": schedule.get("readonly (4)"),
            "description": None,
            "instructor_name": None,
            "time_held1": schedule.get("meeting"),
            "day_held1": schedule.get("ui-pillbox-summary"),
            "building": schedule.get("tooltip-row (3)"),
            "room_number": schedule.get("tooltip-row (5)"),
            "seats": schedule.get("readonly (8)")
        }

        # Additional meeting times (if any)
        for i in range(2, 6):
            time_key = f"meeting ({(i-1) * 5 + 1})"
            day_key = f"ui-pillbox-summary ({i})"
            if time_key in schedule and day_key in schedule:
                formatted_course[f"time_held{i}"] = schedule[time_key]
                formatted_course[f"day_held{i}"] = schedule[day_key]

        formatted_courses.append(formatted_course)

    return formatted_courses

if __name__ == "__main__":
    input_folder = "ExternalScraper"
    output_folder = "ExternalScrapedDataTransformation"

    os.makedirs(output_folder, exist_ok=True)

    for filename in os.listdir(input_folder):
        if filename.endswith(".json"):
            input_path = os.path.join(input_folder, filename)
            output_path = os.path.join(output_folder, filename)

            try:
                with open(input_path, "r") as f:
                    schedule_details = json.load(f)

                formatted_data = reformat_schedule(schedule_details)

                with open(output_path, "w") as f:
                    json.dump(formatted_data, f, indent=4)

                print(f"Processed {filename}  {output_path}")

            except Exception as e:
                print(f"Failed to process {filename}: {e}")

