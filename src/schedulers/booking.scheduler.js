const cron = require("node-cron");
const Booking = require("../modules/booking/booking.model");
const ParkingSlot = require("../modules/parking/parking-slot.model");

const startBookingScheduler = () => {

    cron.schedule("* * * * *", async () => {

        const expiredBookings = await Booking.find({
            status: "reserved",
            endTime: { $lte: new Date() }
        });

        for (const booking of expiredBookings) {

            booking.status = "completed";
            await booking.save();

            const parkingSlot = await ParkingSlot.findById(
                booking.parkingSlot
            );

            if (parkingSlot) {
                parkingSlot.status = "available";
                await parkingSlot.save();
            }
        }

    });
};

module.exports = startBookingScheduler;