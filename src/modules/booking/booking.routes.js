const express = require("express");
const { protect } = require("../../middleware/auth.middleware");
const {
    createBooking,
    getMyBookings
} = require("./booking.controller");

const router = express.Router();

router.post("/", protect, createBooking);
router.get("/", protect, getMyBookings);

module.exports = router;