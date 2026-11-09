
require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/database");
const startBookingScheduler = require("./schedulers/booking.scheduler");

const PORT = process.env.PORT || 8000;

const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Park Easy server running on port ${PORT}`);

            startBookingScheduler();
        });

    } catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }
};

startServer();
