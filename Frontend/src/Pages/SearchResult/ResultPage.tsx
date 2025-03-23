import React, { useEffect, useState } from "react";

function ResultPage() {
    const [courses, setCourses] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        fetch("http://localhost:6968/courses")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to fetch courses");
                }
                return response.json();
            })
            .then((data) => {
                setCourses(data);
            })
            .catch((error) => {
                setError(error.message);
            });
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <h1 className="text-2xl font-bold mb-4">Course Results</h1>

            {error && <p className="text-red-500">{error}</p>}

            {courses.length === 0 ? (
                <p>No courses available</p>
            ) : (
                <ul className="list-none">
                    {courses.map((course, index) => (
                        <li key={index} className="mb-4 p-4 border rounded-md w-80">
                            <h3 className="font-semibold text-xl">{course.courseCode}</h3>
                            <p><strong>Department:</strong> {course.department}</p>
                            <p><strong>Course Number:</strong> {course.courseNumber}</p>
                            <p><strong>Semester:</strong> {course.semester}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default ResultPage;
