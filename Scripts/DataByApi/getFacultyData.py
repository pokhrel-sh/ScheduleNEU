import requests
import json
import time
import os
import glob

# Create output directory
output_dir = "Classes2"
os.makedirs(output_dir, exist_ok=True)

# You must fill this out from the Networks section of the browser. How? Outlined in README.md
headers = {
    "Accept": "application/json",
    "X-Requested-With": "XMLHttpRequest",
    "User-Agent": "",
    "Cookie": ""
}

def enrich_course(i, course, term):
    """Enrich a single course with faculty data"""
    crn = course.get("courseReferenceNumber")
    if not crn or "facultyData" in course:
        return
    
    try:
        url = f"https://nubanner.neu.edu/StudentRegistrationSsb/ssb/searchResults/getFacultyMeetingTimes?term={term}&courseReferenceNumber={crn}"
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        faculty_data = response.json()
        course["facultyData"] = faculty_data
        print(f"[{i+1}] CRN {crn} enriched successfully")
    except Exception as e:
        course["facultyData"] = {"error": str(e)}
        print(f"[{i+1}] CRN {crn} failed: {str(e)}")

def process_term_file(file_path):
    """Process a single term file"""
    filename = os.path.basename(file_path)
    term = filename.replace(".json", "")
    
    print(f"\nProcessing term {term} from {filename}")
    
    # Load courses from file
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            all_courses = json.load(f)
        
        print(f"Loaded {len(all_courses)} courses for term {term}")
        
        # Add faculty data to each course
        for i, course in enumerate(all_courses):
            enrich_course(i, course, term)
            time.sleep(0.1)
        
        # Save to Classes2 
        output_file = os.path.join(output_dir, filename)
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(all_courses, f, indent=2, ensure_ascii=False)
        print(f"Term {term} completed! Saved to {output_file}")       
            
    except FileNotFoundError:
        print(f"File not found: {file_path}")
    except json.JSONDecodeError:
        print(f"Invalid JSON in file: {file_path}")
    except Exception as e:
        print(f"Error processing {file_path}: {str(e)}")

def main():
    input_dir = "Classes"
    
    term_files = glob.glob(os.path.join(input_dir, "*.json"))
    
    # Filter to only include files that look like term file
    term_files = [f for f in term_files if os.path.basename(f).replace(".json", "").isdigit() and len(os.path.basename(f).replace(".json", "")) == 6]
    
    if not term_files:
        print(f"No term files found in {input_dir}/ directory! Looking for files like 202610.json")
        return
    
    term_files.sort() 
    print(f"Found {len(term_files)} term files: {', '.join(term_files)}")
    
    # Process each term file
    for term_file in term_files:
        process_term_file(term_file)
    
    print(f"\nAll {len(term_files)} term files processed successfully!")
    print(f"📁 Enriched files saved to {output_dir}/ directory")

if __name__ == "__main__":
    main()

