import { useState } from "react";

interface Course {
  courseCode: string;
  department: string;
  courseNumber: string;
  semester: string;
}

const exampleCourses: Course[] = [
  {
    courseCode: "CS-1010",
    department: "Computer Science",
    courseNumber: "1010",
    semester: "Fall 2025",
  },
  {
    courseCode: "MATH-2200",
    department: "Mathematics",
    courseNumber: "2200",
    semester: "Spring 2025",
  },
  {
    courseCode: "ENG-1500",
    department: "English",
    courseNumber: "1500",
    semester: "Fall 2024",
  },
];

function ResultPage() {
  const [courses] = useState<Course[]>(exampleCourses);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Course Results</h1>

      {courses.length === 0 ? (
        <p>No courses available</p>
      ) : (
        <ul className="list-none">
          {courses.map((course, idx) => (
            <li key={idx} className="mb-4 p-4 border rounded-md w-80">
              <h3 className="font-semibold text-xl">{course.courseCode}</h3>
              <p>
                <strong>Department:</strong> {course.department}
              </p>
              <p>
                <strong>Course Number:</strong> {course.courseNumber}
              </p>
              <p>
                <strong>Semester:</strong> {course.semester}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ResultPage;
