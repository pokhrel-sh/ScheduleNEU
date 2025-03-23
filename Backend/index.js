import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 6969;

app.use(cors());
app.use(bodyParser.json());

let courses = []
app.post("/api/courses", (req, res) => {
    const { semester, department, courseNumber, courseCode } = req.body;

    if (!semester || !department || !courseNumber || !courseCode) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const courseData =  {semester, department, courseNumber, courseCode }
    console.log("Received Course Data:", courseData);
    courses.push(courseData)
    res.status(200).json({ message: "Course data received successfully!" });
});

app.get("/courses", (req,res) =>{
    if (courses.length === 0) {
        return res.status(404).json({ message: "No courses available" });
    }
    res.json(courses)
});

app.listen(PORT, () => {
    console.log("server running on port", PORT);
});
