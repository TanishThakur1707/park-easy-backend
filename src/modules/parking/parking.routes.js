const express = require("express");
const {
    createParkingLot,
    createParkingSlot,
    getParkingLots,
    getParkingSlots
} = require("./parking.controller");

const router = express.Router();

router.post("/lots", createParkingLot);
router.post("/slots", createParkingSlot);
router.get("/lots", getParkingLots);
router.get("/lots/:lotId/slots", getParkingSlots);

module.exports = router;