const cron = require("node-cron");
const Booking = require("../modules/booking/booking.model");

const startBookingScheduler = () => {

    cron.schedule("* * * * *", async () => {

        console.log("Booking scheduler running...");

        try {
            // Find all reserved bookings whose end time has passed
            const expiredBookings = await Booking.find({
                status: "reserved",
                endTime: { $lte: new Date() }
            });

            console.log("Expired bookings found:", expiredBookings.length);

            // Mark expired bookings as completed
            for (const booking of expiredBookings) {

                booking.status = "completed";

                await booking.save();
            }

        } catch (error) {
            console.error(
                "Booking scheduler error:",
                error.message
            );
        }
    });

};

module.exports = startBookingScheduler;
