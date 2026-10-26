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

module.exports = {
    createBooking,
    getMyBookings
};