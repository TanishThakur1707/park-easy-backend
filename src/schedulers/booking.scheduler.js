const cron = require("node-cron");
const Booking = require("../modules/booking/booking.model");

const startBookingScheduler = () => {
    cron.schedule("* * * * *", async () => {
        console.log("Booking scheduler running...");

        try {
            const now = new Date();

            // 1. Activate bookings whose start time has arrived.
            const activationResult = await Booking.updateMany(
                {
                    status: "reserved",
                    startTime: { $lte: now },
                    endTime: { $gt: now }
                },
                {
                    $set: { status: "active" }
                }
            );

            console.log(
                "Bookings activated:",
                activationResult.modifiedCount
            );

            // 2. Complete bookings whose end time has passed.
            const completionResult = await Booking.updateMany(
                {
                    status: "active",
                    endTime: { $lte: now }
                },
                {
                    $set: { status: "completed" }
                }
            );

            console.log(
                "Bookings completed:",
                completionResult.modifiedCount
            );

        } catch (error) {
            console.error(
                "Booking scheduler error:",
                error.message
            );
        }
    });
};

module.exports = startBookingScheduler;
