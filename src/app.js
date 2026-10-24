const express = require("express");

const app = express();

app.use(express.json());

app.get("/api/v1/health", (req, res) => {
    res.json({
        success: true,
        message: "Park Easy backend is running"
    });
});



module.exports = app;