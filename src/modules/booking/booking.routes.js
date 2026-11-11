const express = require("express");
const { protect } = require("../../middleware/auth.middleware");
const {
    createBooking,
    getMyBookings,
    getBookingById,
    cancelBooking
} = require("./booking.controller");
const {
    validateBookingId,
    validateCreateBooking
} = require("../../middleware/validation.middleware");
const router = express.Router();

router.post("/", protect, validateCreateBooking, createBooking);
router.get("/", protect, getMyBookings);
router.get("/:bookingId", protect, validateBookingId, getBookingById);
router.patch("/:bookingId/cancel", protect, validateBookingId, cancelBooking);

module.exports = router;