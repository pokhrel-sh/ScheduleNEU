import { useState } from "react";
import { semesters } from "./semester"
import { Link } from "react-router-dom";
function SearchPage (){
    const [query, setQuery] = useState("");
    const [selectedCode, setSelectedCode] = useState<string>('');
    const [courseIdentifer, setCourseIdentifier] = useState("");
    const [courseNumber, setCourseNumber] = useState("");


    const handleSearch = () => {
        console.log("Executing search with query:", query);
        // searching will be done in databases
    };

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCode(event.target.value);
        console.log(event.target.value)
    };

    function addToCourses(query: String){
        for(let i = 0; i < query.length; i++){
            let characterToAscii = query.toLowerCase().charCodeAt(i);
            let tempChar: String = query[i];

            if(characterToAscii >= 97 || characterToAscii <= 122){
                setCourseIdentifier((prev) => prev + tempChar)
            } else if (characterToAscii >= 48 || characterToAscii <= 57){
                setCourseNumber((prev) => prev + tempChar)
            }
        }
    }
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="mb-4 w-full max-w-xs">
            <h1 className="text-2xl font-bold mb-4">Search Page</h1>
            <label htmlFor="semesterDropdown" className="mb-2 text-lg">Select a semester:</label>
            <select
              id="semesterDropdown"
              value={selectedCode}
              onChange={handleChange}
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
            <Link
              to="/result"
              className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Search
            </Link>
          </div>
          </div>
        </div>
      );
    };
export default SearchPage;
