# db.py
import os
from course_database import CourseDatabase
from dotenv import load_dotenv

load_dotenv()
db = CourseDatabase(
    url=os.environ["SUPABASE_URL"],
    key=os.environ["SUPABASE_KEY"]
)