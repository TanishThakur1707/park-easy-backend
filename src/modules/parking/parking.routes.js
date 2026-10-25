const express = require("express");
const { createParkingLot, createParkingSlot } = require("./parking.controller");

const router = express.Router();

router.post("/lots", createParkingLot);
router.post("/slots", createParkingSlot);

module.exports = router;