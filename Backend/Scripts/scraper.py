from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.common.exceptions import NoSuchElementException
import json
import time

# Define a class to structure the course data
class CourseData:
    def __init__(self):
        self.term = None
        self.title = None
        self.description = None
        self.crn = None
        self.campus = None
        self.schedule_type = None
        self.instructional_method = None
        self.section_number = None
        self.subject = None
        self.course_number = None
        self.credit_hours = None
        self.course_id = None

driver = webdriver.Firefox()
driver.get("https://nubanner.neu.edu/StudentRegistrationSsb/ssb/term/termSelection?mode=search") 
driver.maximize_window()

time.sleep(2)  

# semester select
term_dropdown = driver.find_element(By.CLASS_NAME, "select2-choice")
term_dropdown.click()

time.sleep(1)


course_terms = "Winter 2025 CPS Quarter"
search_input = driver.find_element(By.CLASS_NAME, "select2-input")
search_input.clear()
search_input.send_keys(course_terms) 
time.sleep(1)


term_results = driver.find_elements(By.CSS_SELECTOR, "#select2-results-1 li")
for result in term_results:
    if "202525" in result.get_attribute("id") or course_terms in result.text:
        result.click()
        break

time.sleep(2)

continue_button = driver.find_element(By.ID, "term-go")
continue_button.click()

time.sleep(5)

search_button = driver.find_element(By.ID, "search-go")
search_button.click()

time.sleep(5)

dropdown = driver.find_element(By.CLASS_NAME, "page-size-select")
dropdown.click()
time.sleep(1)

option_50 = driver.find_element(By.XPATH, "//select[@class='page-size-select']/option[@value='50']")
option_50.click()

assert "50" in dropdown.text

time.sleep(2)
total_pages_element = driver.find_element(By.CLASS_NAME, "total-pages")
totalPage = int(total_pages_element.text)
print(f"Total pages: {totalPage}")

all_courses = []

for page in range(1, 2):
    try:
        print(f"Processing page {page} of {totalPage}")
        
        tbody = driver.find_element(By.TAG_NAME, "tbody")
        rows = tbody.find_elements(By.TAG_NAME, "tr")
        
        for row in rows:
            try:
                title_cell = row.find_element(By.XPATH, ".//td[@data-property='courseTitle']")
                title_link = title_cell.find_element(By.CLASS_NAME, "section-details-link")
                course_id = row.get_attribute("data-id")

                course_data = CourseData()
                course_data.course_id = course_id


                print(f"Clicking on course ID: {course_id}")
                title_link.click()
                time.sleep(2)
                
                try:
                    popup = driver.find_element(By.CLASS_NAME, "ui-dialog")
                    
                    class_details_section = popup.find_element(By.XPATH, "//section[@aria-labelledby='classDetails']")                    
                    course_data.term = course_terms
                    
                    crn_element = class_details_section.find_element(By.ID, "courseReferenceNumber")
                    course_data.crn = crn_element.text.strip()
                    
                    try:
                        campus_element = driver.find_element(By.XPATH, "//span[text()='Campus:']/following-sibling::text()")
                        campus_name = campus_element.strip()
                        course_data.campus = campus_name
                    except Exception as e:
                        print(f"Error extracting campus name for course ID {course_data.course_id}: {e}")
                    
                    try:
                        section_element = row.find_element(By.XPATH, ".//td[@data-property='courseTitle']//span")
                        course_data.schedule_type = section_element.text.strip() 
                    except NoSuchElementException:
                        course_data.schedule_type = "N/A"
                    
                    try:
                        instructional_method_element = driver.find_element(By.XPATH, "//span[text()='Instructional Method:']/following-sibling::text()")
                        instructional_method = instructional_method_element.strip()
                        course_data.instructional_method = instructional_method
                    except Exception as e:
                        print(f"Error extracting instructional method for course ID {course_data.course_id}: {e}")
                    
                    section_number_element = class_details_section.find_element(By.ID, "sectionNumber")
                    course_data.section_number = section_number_element.text.strip()
                    
                    subject_element = class_details_section.find_element(By.ID, "subject")
                    course_data.subject = subject_element.text.strip()
                    
                    course_number_element = class_details_section.find_element(By.ID, "courseNumber")
                    course_data.course_number = course_number_element.text.strip()
                    
                    title_element = class_details_section.find_element(By.ID, "courseTitle")
                    course_data.title = title_element.text.strip()

                    # class_description_section = popup.find_element(By.XPATH, "//section[@aria-labelledby='courseDescription']")
                    # description_element = class_description_section.find_element(By.ID, "classDetailsContentDiv")
                    # description_element2 = description_element.find_element(By.ID, "classDetailsContentDetailsDiv")
                    # course_data.description = description_element2.text.strip()

                    print(f"Successfully extracted data for course: {course_data.title} (ID: {course_id})")
                

                    close_button = popup.find_element(By.CLASS_NAME, "ui-dialog-titlebar-close")
                    close_button.click()
                    time.sleep(1)
                    
                    all_courses.append(course_data.__dict__)
                    
                except Exception as e:
                    print(f"Error extracting data from popup for course ID {course_id}: {e}")
                
            except Exception as e:
                print(f"Error processing row: {e}")
                continue
        
        if page < totalPage:
            next_button = driver.find_element(By.XPATH, "//button[@title='Next']")
            if "disabled" not in next_button.get_attribute("class"):
                next_button.click()
                time.sleep(3)
            else:
                print("Next button is disabled, ending pagination")
                break
                
    except Exception as e:
        print(f"Error on page {page}: {e}")
        break

with open("courses.json", "w", encoding="utf-8") as f:
    json.dump(all_courses, f, indent=4, ensure_ascii=False)

print(f"Data saved to courses.json - Total courses scraped: {len(all_courses)}")

# time.sleep(5)
# driver.close()