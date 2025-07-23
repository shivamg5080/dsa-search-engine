// Import required modules
const express = require("express");        // Express framework to create server and APIs
const { spawn } = require("child_process"); // Used to run Python scripts from Node.js
const cors = require("cors");              // Middleware to allow requests from other origins (e.g., frontend on another port)

const app = express(); // Initialize the Express app

// Middleware setup
app.use(express.json()); // Parse incoming JSON requests
app.use(cors());         // Enable Cross-Origin Resource Sharing

// ========================
// 🔍 Search API Endpoint
// ========================
app.post("/api/search", (req, res) => {
  const query = req.body.query; // Get the 'query' value from the request body

  // Run the Python script and pass the query as a command-line argument
  const pythonProcess = spawn("python", ["../../TF-IDF/query.py", query]);

  let outputData = ""; // To collect data coming from the Python script

  // When Python script sends data back (stdout), store it
  pythonProcess.stdout.on("data", (data) => {
    outputData += data.toString(); // Convert buffer to string and add to outputData
  });

  // When Python script finishes execution
  pythonProcess.on("close", (code) => {
    if (code === 0) {
      // Script finished successfully
      try {
        const resultList = JSON.parse(outputData); // Try parsing output as JSON
        res.json(resultList);                      // Send the parsed result back to frontend
      } catch (error) {
        // If parsing fails
        console.error("Error parsing JSON:", error);
        res.status(500).json({ error: "Error parsing JSON" });
      }
    } else {
      // If script exited with error
      console.error("Python script execution failed");
      res.status(500).json({ error: "Python script execution failed" });
    }
  });
});

// ===========================
// ✅ Root Route (Test Route)
// ===========================
app.get("/", (req, res) => {
  res.send("Server is running successfully"); // Simple message to check if server is up
});

// =========================
// 🔊 Start the Server
// =========================
app.listen(process.env.PORT || 5000, () => {
  // Use PORT from environment if available, else use 5000
  console.log("Backend server is running on http://localhost:5000");
});

