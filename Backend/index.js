import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 6969;

app.use(cors());
app.use(bodyParser.json());

//const { MongoClient } = require('mongodb');

let courses = []
let coursess = []
app.post("/api/courses", (req, res) => {
    if(courses.length > 0){
        courses.length = 0
    }

    const { semester, department, courseNumber, courseCode } = req.body;

    if (!semester || !department || !courseNumber || !courseCode) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const courseData =  {semester, department, courseNumber, courseCode }
//
//    const uri = "mongodb+srv://<username>:<password>@<your-cluster-url>/sample_airbnb?retryWrites=true&w=majority";
//
//    const client = new MongoClient(uri);
//
//    try {
//        await client.connect();
//        await  listDatabases(client);
//    } catch (e) {
//        console.error(e);
//    } finally {
//        await client.close();
//    }

    console.log("Received Course Data:", courseData);
    courses.push(courseData)
    coursess.push(courses)
    console.log(coursess)
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
