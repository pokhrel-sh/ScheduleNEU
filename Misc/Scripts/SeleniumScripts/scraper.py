from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException, TimeoutException
import json
import time

# Define a class to structure the course data
class CourseData:
    def __init__(self):
        self.term = None
        self.crn = None
        self.campus = None
        self.schedule_type = None
        self.instructional_method = None
        self.section_number = None
        self.subject = None 
        self.course_code = None
        self.course_number = None
        self.title = None
        self.credit_hours = None
        self.grade_mode = None
        self.description = None
        self.instructor_name = None
        self.time_held = None
        self.date_held = None
        self.building_name = None
        self.room_number = None
        self.seats_available = None
        self.waitlist_available = None
        self.prerequisite = None



driver = webdriver.Firefox()
driver.get("https://nubanner.neu.edu/StudentRegistrationSsb/ssb/term/termSelection?mode=search")
driver.maximize_window()

time.sleep(2)
wait = WebDriverWait(driver, 10)

term_dropdown = driver.find_element(By.CLASS_NAME, "select2-choice")
term_dropdown.click()

time.sleep(1)


course_terms = "Fall 2025 Semester"
search_input = driver.find_element(By.CLASS_NAME, "select2-input")
search_input.clear()
search_input.send_keys(course_terms)
time.sleep(1)


term_results = driver.find_elements(By.CSS_SELECTOR, "#select2-results-1 li")
for result in term_results:
    if "202610" in result.get_attribute("id") or course_terms in result.text:
        result.click()
        break

time.sleep(2)

continue_button = driver.find_element(By.ID, "term-go")
continue_button.click()

time.sleep(5)

search_button = driver.find_element(By.ID, "search-go")
time.sleep(2)
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

def safe_get_text(xpath):
    try:
        return driver.find_element(By.XPATH, xpath).text.strip()
    except NoSuchElementException:
        return "N/A"


for page in range(1, 10):
    try:
        print(f"Processing page {page} of {totalPage}")
        # Wait for tbody to be present
        tbody = wait.until(EC.presence_of_element_located((By.TAG_NAME, "tbody")))
        rows = tbody.find_elements(By.TAG_NAME, "tr")
        for row in rows:
            course_data = CourseData()
            try:
                title_cell = row.find_element(By.XPATH, ".//td[@data-property='courseTitle']")
                title_link = title_cell.find_element(By.CLASS_NAME, "section-details-link")
                course_data.title = title_link.text.strip()

                course_subject = row.find_element(By.XPATH, ".//td[@data-property='subjectDescription']")
                course_subject_text = course_subject.text.strip().split()

                course_number = row.find_element(By.XPATH, ".//td[@data-property='courseNumber']")
                course_data.course_number = course_number.text.strip()

                section_numbers = row.find_element(By.XPATH, ".//td[@data-property='sequenceNumber']")
                course_data.section_number = section_numbers.text.strip()

                credit_hours = row.find_element(By.XPATH, ".//td[@data-property='creditHours']")
                course_data.credit_hours = credit_hours.text.strip()

                course_reference_number = row.find_element(By.XPATH, ".//td[@data-property='courseReferenceNumber']")
                course_data.crn = course_reference_number.text.strip()

                terms = row.find_element(By.XPATH, ".//td[@data-property='term']")
                course_data.term = terms.text.strip()

                course_data.course_code = course_subject_text[-1]

                course_data.subject = " ".join(course_subject_text[:-1])

                title_link.click()
                
                course_description_tab = wait.until(EC.element_to_be_clickable((By.ID, "courseDescription")))
                course_description_tab.click()

                course_description_section = wait.until(EC.visibility_of_element_located(
                    (By.XPATH, "//section[@aria-labelledby='courseDescription']")))
                course_data.description = course_description_section.text.strip()

                faculty_tab = wait.until(EC.element_to_be_clickable((By.ID, "facultyMeetingTimes")))
                faculty_tab.click()

                # instructor_element = wait.until(EC.visibility_of_element_located(
                #     (By.CSS_SELECTOR, ".meeting-faculty-member a.email")))
                # instructor_name = instructor_element.text.strip()
                # course_data.instructor_name = instructor_name
                try:
                    instructor_element = wait.until(EC.visibility_of_element_located(
                        (By.CSS_SELECTOR, ".meeting-faculty-member a.email")
                    ))
                    course_data.instructor_name = instructor_element.text.strip()
                except TimeoutException:
                    course_data.instructor_name = "No instructor listed"

                close_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Close')]")))
                close_button.click()

                # when clicking the course, it has a hyperlink extention popup right next to the element
                # it can block the view of the next button, which breaks the program
                # this clicks at the attribute column of the row, this makes hyperlink popup disappear, thus reducing the breaks
                randomTextBox = row.find_element(By.XPATH, ".//td[@data-property='attribute']")
                randomTextBox.click()

                time.sleep(0.5)
                
                print(course_data.__dict__)
                all_courses.append(course_data.__dict__)
            except Exception as e:
                print(f"Error processing row: {e}")
                continue
            print()

        if page < totalPage:
   
            current_page_input = driver.find_element(By.CLASS_NAME, "page-number")
            current_page = current_page_input.get_attribute("value")
            
            next_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[@title='Next']")))
            if "disabled" not in next_button.get_attribute("class"):
                next_button.click()
                
                WebDriverWait(driver, 10).until(
                    lambda d: d.find_element(By.CLASS_NAME, "page-number").get_attribute("value") != current_page
                )
                
                time.sleep(2)
                
                new_page = driver.find_element(By.CLASS_NAME, "page-number").get_attribute("value")
                print(f"Successfully navigated to page {new_page}")
            else:
                print("Next button is disabled, ending pagination")
                break

    except Exception as e:
        print(f"Error on page {page}: {e}")
        break

with open("Fall_2025_Semester.json", "w", encoding="utf-8") as f:
    json.dump(all_courses, f, indent=4, ensure_ascii=False)

print(f"Data saved to courses.json - Total courses scraped: {len(all_courses)}")

time.sleep(5)
driver.close()