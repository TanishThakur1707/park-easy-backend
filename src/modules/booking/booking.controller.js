const Booking = require("./booking.model");
const ParkingSlot = require("../parking/parking-slot.model");

const createBooking = async (req, res) => {
    try {
        const { parkingSlot, startTime, endTime } = req.body;

        // 1. Validate required fields
        if (!parkingSlot || !startTime || !endTime) {
            return res.status(400).json({
                success: false,
                message: "parkingSlot, startTime and endTime are required"
            });
        }

        // 2. Check whether parking slot exists
        const existingSlot = await ParkingSlot.findById(parkingSlot);

        if (!existingSlot) {
            return res.status(404).json({
                success: false,
                message: "Parking slot not found"
            });
        }

        // 3. Check whether slot is available
        if (existingSlot.status !== "available") {
            return res.status(400).json({
                success: false,
                message: "Parking slot is not available"
            });
        }

        // 4. Make sure end time is after start time
        if (new Date(endTime) <= new Date(startTime)) {
            return res.status(400).json({
                success: false,
                message: "End time must be after start time"
            });
        }

        // 5. Create booking
        const booking = await Booking.create({
            user: req.user.userId,
            parkingSlot,
            startTime,
            endTime
        });

        // 6. Reserve the parking slot
        existingSlot.status = "reserved";
        await existingSlot.save();

        // 7. Send response
        return res.status(201).json({
            success: true,
            message: "Booking created successfully",
            data: booking
        });

    } catch (error) {
        console.error("Create booking error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
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
    try {
        const { bookingId } = req.params;

        // 1. Find the booking
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        // 2. Check whether the booking belongs to the logged-in user
        if (booking.user.toString() !== req.user.userId) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to cancel this booking"
            });
        }

        // 3. Check whether booking is already cancelled
        if (booking.status === "cancelled") {
            return res.status(400).json({
                success: false,
                message: "Booking is already cancelled"
            });
        }

        // 4. Cancel the booking
        booking.status = "cancelled";
        await booking.save();

        // 5. Make the parking slot available again
        const parkingSlot = await ParkingSlot.findById(booking.parkingSlot);

        if (parkingSlot) {
            parkingSlot.status = "available";
            await parkingSlot.save();
        }

        // 6. Send response
        return res.status(200).json({
            success: true,
            message: "Booking cancelled successfully",
            data: booking
        });

    } catch (error) {
        console.error("Cancel booking error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = {
    createBooking,
    getMyBookings,
    getBookingById,
    cancelBooking
};