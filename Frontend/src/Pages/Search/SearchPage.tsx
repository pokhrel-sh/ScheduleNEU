import { useState } from "react";
import { semesters } from "./semester";
import { useNavigate } from "react-router-dom";

function SearchPage() {
    const [query, setQuery] = useState("");
    const [selectedCode, setSelectedCode] = useState<string>('');
    const [courseIdentifier, setCourseIdentifier] = useState("");
    const [courseNumber, setCourseNumber] = useState("");
    const navigate = useNavigate();

    const getCourseInfo = (query: string) => {
        let courseID = "";
        let courseNum = "";

        for (let i = 0; i < query.length; i++) {
            const characterToAscii = query.toLowerCase().charCodeAt(i);
            const tempChar = query[i];

            if (characterToAscii >= 97 && characterToAscii <= 122) {
                courseID += tempChar;
            } else if (characterToAscii >= 48 && characterToAscii <= 57) {
                courseNum += tempChar;
            }
        }

        setCourseIdentifier(courseID);
        setCourseNumber(courseNum);
    };

    const handleSearch = async () => {
        if (!query) {
            console.error("Course code is empty.");
            return;
        }

        getCourseInfo(query);

        const courseCode = courseIdentifier + courseNumber;

        if (!selectedCode || !courseIdentifier || !courseNumber) {
            console.error("Semester or course details missing");
            return;
        }

        const courseData = {
            semester: selectedCode,
            department: courseIdentifier,
            courseNumber: courseNumber,
            courseCode: courseCode
        };

        console.log("Sending data:", courseData);

        try {
            const response = await fetch("http://localhost:6968/api/coursess", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(courseData),
            });

            if (!response.ok) {
                throw new Error("Failed to send course data");
            }

            const result = await response.json();
            console.log("Course info sent successfully:", result);

            navigate("/result");
        } catch (error) {
            console.error("Error sending course data:", error);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="mb-4 w-full max-w-xs">
                <h1 className="text-2xl font-bold mb-4">Search Page</h1>
                <label htmlFor="semesterDropdown" className="mb-2 text-lg">Select a semester:</label>
                <select
                    id="semesterDropdown"
                    value={selectedCode}
                    onChange={(e) => setSelectedCode(e.target.value)}
                    className="p-2 border rounded-md w-full"
                >
                    <option value="">--Select a Semester--</option>
                    {semesters.map((semester) => (
                        <option key={semester.code} value={semester.code}>
                            {semester.description}
                        </option>
                    ))}
                </select>
            </div>
            <div className="mb-4 w-full max-w-xs">
                <label className="text-lg">Enter Course Code</label>
                <div className="flex space-x-2 mb-4">
                    <input
                        type="text"
                        placeholder="Enter course code (CS 4500)"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="p-2 border rounded-md w-64"
                    />
                    <button
                        onClick={handleSearch}
                        className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                        Search
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SearchPage;
