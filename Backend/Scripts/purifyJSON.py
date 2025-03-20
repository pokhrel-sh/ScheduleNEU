import json

def extract_course_info(data):
    extracted_courses = []
    for entry in data:
        course_info = {
            "title": entry.get("section-details-link"),
            "department": entry.get("readonly"),
            "courseNumber": entry.get("readonly (2)"),
            "sectionNumber": entry.get("readonly (3)"),
            "creditHours": entry.get("readonly (4)"),
            "courseReferenceNumber": entry.get("readonly (5)"),
            "meetingDays": entry.get("ui-pillbox-summary"),
            "meetingTimes": entry.get("meeting"),
            "meetingDay2": entry.get("ui-pillbox-summary (2)"),
            "meetingTimes2": entry.get("meeting (6)"),
            "campus": entry.get("readonly (7)")
        }
        extracted_courses.append(course_info)
    return extracted_courses

if __name__ == "__main__":
    input_filename = "input.json"
    output_filename = "output.json"
    
    try:
        with open(input_filename, "r") as infile:
            data = json.load(infile)
            extracted_info = extract_course_info(data)
        
        with open(output_filename, "w") as outfile:
            json.dump(extracted_info, outfile, indent=4)
        
        print(f"Extracted information saved to {output_filename}")
    except json.JSONDecodeError:
        print("Invalid JSON in input file.")
    except FileNotFoundError:
        print(f"File {input_filename} not found.")