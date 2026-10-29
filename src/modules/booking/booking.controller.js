const Booking = require("./booking.model");
const ParkingSlot = require("../parking/parking-slot.model");
const mongoose = require("mongoose");



const createBooking = async (req, res) => {
    let session;

    try {
        const { parkingSlot, startTime, endTime } = req.body;

        // 1. Validate required fields
        if (!parkingSlot || !startTime || !endTime) {
            return res.status(400).json({
                success: false,
                message: "parkingSlot, startTime and endTime are required"
            });
        }

        // 2. Validate the parking slot ID
        if (!mongoose.isValidObjectId(parkingSlot)) {
            return res.status(400).json({
                success: false,
                message: "Invalid parking slot ID"
            });
        }

        // 3. Validate booking dates
        const requestedStartTime = new Date(startTime);
        const requestedEndTime = new Date(endTime);

        if (
            Number.isNaN(requestedStartTime.getTime()) ||
            Number.isNaN(requestedEndTime.getTime())
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid start time or end time"
            });
        }

        if (requestedEndTime <= requestedStartTime) {
            return res.status(400).json({
                success: false,
                message: "End time must be after start time"
            });
        }

        if (requestedStartTime < new Date()) {
            return res.status(400).json({
                success: false,
                message: "Booking start time cannot be in the past"
            });
        }

        // 4. Start a MongoDB transaction
        session = await mongoose.startSession();

        let booking;

        await session.withTransaction(
            async () => {
                // 5. Write to this slot document.
                // Concurrent transactions for the same slot conflict here.
                const slot = await ParkingSlot.findOneAndUpdate(
                    { _id: parkingSlot },
                    { $inc: { bookingVersion: 1 } },
                    {
                        new: true,
                        session
                    }
                );

                if (!slot) {
                    const error = new Error("Parking slot not found");
                    error.statusCode = 404;
                    throw error;
                }

                // 6. Check for overlapping bookings inside the transaction
                const overlappingBooking = await Booking.findOne({
                    parkingSlot: slot._id,
                    status: { $in: ["reserved", "active"] },
                    startTime: { $lt: requestedEndTime },
                    endTime: { $gt: requestedStartTime }
                }).session(session);

                if (overlappingBooking) {
                    const error = new Error(
                        "Parking slot is already booked for this time"
                    );
                    error.statusCode = 409;
                    throw error;
                }

                // 7. Create the booking in the same transaction
                const createdBookings = await Booking.create(
                    [
                        {
                            user: req.user.userId,
                            parkingSlot: slot._id,
                            startTime: requestedStartTime,
                            endTime: requestedEndTime
                        }
                    ],
                    { session }
                );

                booking = createdBookings[0];
            },
            {
                readPreference: "primary",
                readConcern: { level: "snapshot" },
                writeConcern: { w: "majority" }
            }
        );

        // 8. Return success only after the transaction commits
        return res.status(201).json({
            success: true,
            message: "Booking created successfully",
            data: booking
        });

    } catch (error) {
        console.error("Create booking error:", error.message);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode
                ? error.message
                : "Internal server error"
        });

    } finally {
        if (session) {
            await session.endSession();
        }
    }
};



const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({
            user: req.user.userId
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Bookings fetched successfully",
            data: bookings
        });

    } catch (error) {
        console.error("Get bookings error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const getBookingById = async (req, res) => {
    try {
        const { bookingId } = req.params;

        // 1. Find the booking
        const booking = await Booking.findById(bookingId);

        // 2. Check whether booking exists
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        // 3. Check whether this booking belongs to the logged-in user
        if (booking.user.toString() !== req.user.userId) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to view this booking"
            });
        }

        // 4. Send booking
        return res.status(200).json({
            success: true,
            message: "Booking fetched successfully",
            data: booking
        });

    } catch (error) {
        console.error("Get booking error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};



const cancelBooking = async (req, res) => {
    let session;

    try {
        const { bookingId } = req.params;

        if (!mongoose.isValidObjectId(bookingId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking ID"
            });
        }

        // Start a transaction
        session = await mongoose.startSession();

        let cancelledBooking;

        await session.withTransaction(async () => {
            // Read the booking inside the transaction
            const booking = await Booking.findById(bookingId).session(session);

            if (!booking) {
                const error = new Error("Booking not found");
                error.statusCode = 404;
                throw error;
            }

            // Check ownership
            if (booking.user.toString() !== req.user.userId) {
                const error = new Error(
                    "You are not authorized to cancel this booking"
                );
                error.statusCode = 403;
                throw error;
            }

            if (booking.status === "cancelled") {
                const error = new Error("Booking is already cancelled");
                error.statusCode = 400;
                throw error;
            }

            if (booking.status === "completed") {
                const error = new Error(
                    "Completed booking cannot be cancelled"
                );
                error.statusCode = 400;
                throw error;
            }

            if (new Date(booking.endTime) <= new Date()) {
                const error = new Error(
                    "Booking has already ended and cannot be cancelled"
                );
                error.statusCode = 400;
                throw error;
            }

            // Coordinate with booking creation for this slot
            const slot = await ParkingSlot.findOneAndUpdate(
                { _id: booking.parkingSlot },
                { $inc: { bookingVersion: 1 } },
                { new: true, session }
            );

            if (!slot) {
                const error = new Error("Parking slot not found");
                error.statusCode = 404;
                throw error;
            }

            // Change status inside the same transaction
            booking.status = "cancelled";
            await booking.save({ session });

            cancelledBooking = booking;
        });

        return res.status(200).json({
            success: true,
            message: "Booking cancelled successfully",
            data: cancelledBooking
        });

    } catch (error) {
        console.error("Cancel booking error:", error.message);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode
                ? error.message
                : "Internal server error"
        });

    } finally {
        if (session) {
            await session.endSession();
        }
    }
};



module.exports = {
    createBooking,
    getMyBookings,
    getBookingById,
    cancelBooking
};