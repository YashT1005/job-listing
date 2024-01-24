require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require('./routes/jobRoutes')

// Create a server
const app = express();

app.use(express.json());

// Connect to MongoDB̥
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("Database Connected"))
    .catch((error) => console.log("Failed to connect", error));

// health Api
app.get("/health", (req, res) => {
    res.json({
        service: "Job Listing sever",
        status: "Active",
        time: new Date(),
    });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/job", jobRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🔥 Server listening on PORT ${ PORT }`);
});
