const express = require("express");
const {
    createParkingLot,
    createParkingSlot,
    getParkingLots
} = require("./parking.controller");

const router = express.Router();

router.post("/lots", createParkingLot);
router.post("/slots", createParkingSlot);
router.get("/lots", getParkingLots);

module.exports = router;