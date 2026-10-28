require("dotenv").config();
const startBookingScheduler = require("./schedulers/booking.scheduler");

const app = require("./app");
const connectDB = require("./config/database");

const PORT = process.env.PORT || 8000;

connectDB();

app.listen(PORT, () => {
    console.log(`Park Easy server running on port ${PORT}`);
    startBookingScheduler();
});