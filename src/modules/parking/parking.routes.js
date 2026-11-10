
const express = require("express");
const {
    createParkingLot,
    createParkingSlot,
    getParkingLots,
    getParkingSlots,
    getParkingSlot,
    checkSlotAvailability
} = require("./parking.controller");

const router = express.Router();

router.post("/lots", createParkingLot);
router.post("/slots", createParkingSlot);
router.get("/lots", getParkingLots);
router.get("/lots/:lotId/slots", getParkingSlots);
router.get("/slots/:slotId", getParkingSlot);
router.get("/slots/:slotId/availability", checkSlotAvailability);

module.exports = router;
