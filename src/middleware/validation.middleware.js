
const mongoose = require("mongoose");

// Validate booking ID from URL parameters
const validateBookingId = (req, res, next) => {
    const { bookingId } = req.params;

    if (!mongoose.isValidObjectId(bookingId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid booking ID"
        });
    }

    next();
};

const validateCreateBooking = (req, res, next) => {
    const { parkingSlot, startTime, endTime } = req.body;

    // 1. Validate required fields
    if (!parkingSlot || !startTime || !endTime) {
        return res.status(400).json({
            success: false,
            message: "parkingSlot, startTime and endTime are required"
        });
    }

    // 2. Validate parking slot ID
    if (!mongoose.isValidObjectId(parkingSlot)) {
        return res.status(400).json({
            success: false,
            message: "Invalid parking slot ID"
        });
    }

    // 3. Validate dates
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

    // 4. Validate time interval
    if (requestedEndTime <= requestedStartTime) {
        return res.status(400).json({
            success: false,
            message: "End time must be after start time"
        });
    }

    // 5. Prevent past bookings
    if (requestedStartTime < new Date()) {
        return res.status(400).json({
            success: false,
            message: "Booking start time cannot be in the past"
        });
    }

    next();
};


module.exports = {
    validateBookingId,
    validateCreateBooking
};
