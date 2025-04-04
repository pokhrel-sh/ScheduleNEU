import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 6969;

app.use(cors());
app.use(bodyParser.json());

import { MongoClient } from "mongodb";
const client = new MongoClient("mongodb://localhost:27017/");

let courses = []
let coursess = []

app.post("/api/courses", async (req, res) => {
    const { semester, department, courseNumber, courseCode } = req.body;

    if (!semester || !department || !courseNumber || !courseCode) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        await client.connect();
        const db = client.db("Courses");
        const collection = db.collection(semester);

        const courseData = await collection.findOne({ courseCode });

        if (!courseData) {
            return res.status(404).json({ error: "Course not found" });
        }

        console.log("Fetched Course Data:", courseData);
        res.status(200).json(courseData);
    } catch (error) {
        console.error("Error querying MongoDB:", error);
        res.status(500).json({ error: "Internal Server Error" });
    } finally {
        await client.close();
    }
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
