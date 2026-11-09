
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

            // 2. Complete bookings that were active and have ended.
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

            // 3. Expire reserved bookings whose end time has passed.
            const expirationResult = await Booking.updateMany(
                {
                    status: "reserved",
                    endTime: { $lte: now }
                },
                {
                    $set: { status: "expired" }
                }
            );

            console.log(
                "Bookings expired:",
                expirationResult.modifiedCount
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
