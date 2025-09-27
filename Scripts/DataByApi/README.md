Please run these file in order

### Gets the course info (apart from faculty data)
getCourseInfo.py -> Generates "Classes" directory.

### Get faculty Data for each of the courses.
getFacultyData.py -> Uses "Classes" directory and adds faculty information and returns a Classes2 dir.



### Result
After this is processed, you can delete the folder "Classes". The course information is located at Classes2
* This is in a json format (you can use a document based database for this)
    * Data Transformation script is provided to turn it into a postgres sql schema. 

    