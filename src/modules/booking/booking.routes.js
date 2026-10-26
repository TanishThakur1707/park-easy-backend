const express = require("express");
const { protect } = require("../../middleware/auth.middleware");
const {
    createBooking,
    getMyBookings,
    getBookingById
} = require("./booking.controller");

const router = express.Router();

router.post("/", protect, createBooking);
router.get("/", protect, getMyBookings);
router.get("/:bookingId", protect, getBookingById);

module.exports = router;