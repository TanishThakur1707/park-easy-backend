
const cron = require("node-cron");
const mongoose = require("mongoose");

const Booking = require("../modules/booking/booking.model");
const ParkingSlot = require("../modules/parking/parking-slot.model");
const { syncSlotOccupancy } = require("../modules/parking/parking.service");

const processBookingTransition = async (
    bookingId,
    expectedStatus,
    newStatus,
    now
) => {
    const session = await mongoose.startSession();

    try {
        await session.withTransaction(
            async () => {
                const booking = await Booking.findById(bookingId)
                    .session(session);

                if (!booking || booking.status !== expectedStatus) {
                    return;
                }

                const lockedSlot = await ParkingSlot.findByIdAndUpdate(
                    booking.parkingSlot,
                    {
                        $inc: { bookingVersion: 1 }
                    },
                    {
                        new: true,
                        session
                    }
                );

                if (!lockedSlot) {
                    throw new Error("Parking slot not found");
                }

                const transitionFilter = {
                    _id: bookingId,
                    status: expectedStatus
                };

                if (newStatus === "active") {
                    transitionFilter.startTime = { $lte: now };
                    transitionFilter.endTime = { $gt: now };
                } else {
                    transitionFilter.endTime = { $lte: now };
                }

                const result = await Booking.updateOne(
                    transitionFilter,
                    {
                        $set: { status: newStatus }
                    },
                    { session }
                );

                if (result.modifiedCount === 0) {
                    return;
                }

                await syncSlotOccupancy(
                    booking.parkingSlot,
                    session
                );
            },
            {
                readPreference: "primary",
                readConcern: { level: "snapshot" },
                writeConcern: { w: "majority" }
            }
        );
    } finally {
        await session.endSession();
    }
};

const startBookingScheduler = () => {
    cron.schedule("* * * * *", async () => {
        console.log("Booking scheduler running...");

        try {
            const now = new Date();

            const bookingsToActivate = await Booking.find({
                status: "reserved",
                startTime: { $lte: now },
                endTime: { $gt: now }
            }).select("_id");

            for (const booking of bookingsToActivate) {
                await processBookingTransition(
                    booking._id,
                    "reserved",
                    "active",
                    now
                );
            }

            console.log(
                "Bookings processed for activation:",
                bookingsToActivate.length
            );

            const bookingsToComplete = await Booking.find({
                status: "active",
                endTime: { $lte: now }
            }).select("_id");

            for (const booking of bookingsToComplete) {
                await processBookingTransition(
                    booking._id,
                    "active",
                    "completed",
                    now
                );
            }

            console.log(
                "Bookings processed for completion:",
                bookingsToComplete.length
            );

            const bookingsToExpire = await Booking.find({
                status: "reserved",
                endTime: { $lte: now }
            }).select("_id");

            for (const booking of bookingsToExpire) {
                await processBookingTransition(
                    booking._id,
                    "reserved",
                    "expired",
                    now
                );
            }

            console.log(
                "Bookings processed for expiration:",
                bookingsToExpire.length
            );

        } catch (error) {
            console.error("Booking scheduler error:", error);
        }
    });
};

module.exports = startBookingScheduler;


