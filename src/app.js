const express = require("express");
const authRoutes = require("./modules/auth/auth.routes");
const parkingRoutes = require("./modules/parking/parking.routes");

const app = express();

app.use(express.json());
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/parking", parkingRoutes);

app.get("/api/v1/health", (req, res) => {
    res.json({
        success: true,
        message: "Park Easy backend is running"
    });
});



module.exports = app;