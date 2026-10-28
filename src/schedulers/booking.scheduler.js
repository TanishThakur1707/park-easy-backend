const cron = require("node-cron");
const Booking = require("../modules/booking/booking.model");

const startBookingScheduler = () => {

    cron.schedule("* * * * *", async () => {

        console.log("Booking scheduler running...");

        try {
            const now = new Date();

            // 1. Start bookings whose start time has arrived
            const bookingsToActivate = await Booking.find({
                status: "reserved",
                startTime: { $lte: now },
                endTime: { $gt: now }
            });

            for (const booking of bookingsToActivate) {

                booking.status = "active";

                await booking.save();
            }

            console.log(
                "Bookings activated:",
                bookingsToActivate.length
            );

            // 2. Complete bookings whose end time has passed
            const bookingsToComplete = await Booking.find({
                status: "active",
                endTime: { $lte: now }
            });

            for (const booking of bookingsToComplete) {

                booking.status = "completed";

                await booking.save();
            }

            console.log(
                "Bookings completed:",
                bookingsToComplete.length
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