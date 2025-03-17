const express = require('express');

const app = express();
const PORT = 3000;

app.get('/courses', async (req, res) => {
    try {
        // Step 1: First POST request to initialize the search (no parameters, no cookies)
        await fetch('https://nubanner.neu.edu/StudentRegistrationSsb/ssb/term/search', {
            method: 'POST',
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json, text/javascript',
                'Referer': 'https://nubanner.neu.edu/StudentRegistrationSsb/ssb/classSearch/classSearch',
                'Content-Type': 'application/json'
            }
        });

        // Step 2: Second POST request for course search (no session, no cookies)
        const response = await fetch('https://nubanner.neu.edu/StudentRegistrationSsb/ssb/searchResults/searchResults', {
            method: 'POST',
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json, text/javascript',
                'Referer': 'https://nubanner.neu.edu/StudentRegistrationSsb/ssb/classSearch/classSearch',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                txt_subject: "CS",
                txt_courseNumber: "2500",
                txt_term: "202530"
            })
        });

        // Parse JSON response
        const data = await response.json();

        // Send JSON response
        console.log(data)
        res.json(data);

    } catch (error) {
        console.error("Error fetching course data:", error);
        res.status(500).json({ error: "Failed to fetch course data" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
