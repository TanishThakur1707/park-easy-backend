
const express = require("express");

const {
    createParkingLot,
    createParkingSlot,
    getParkingLots,
    getParkingSlots,
    getParkingSlot,
    checkSlotAvailability
} = require("./parking.controller");

const {
    searchParking
} = require("./parking-search.controller");

const {
    validateParkingSearch
} = require("./parking-search.validation");
const { generateSlots } = require("./parking-slot-generation.controller");
const { getAnalytics } = require("./parking-analytics.controller");

const router = express.Router();

// Smart parking search
router.get("/search", validateParkingSearch, searchParking);

// Existing parking routes
router.post("/lots", createParkingLot);
router.post("/slots", createParkingSlot);

router.get("/lots", getParkingLots);
router.get("/lots/:lotId/slots", getParkingSlots);

router.get("/slots/:slotId", getParkingSlot);
router.get("/slots/:slotId/availability", checkSlotAvailability);
router.post("/lots/:lotId/slots/generate", generateSlots);
router.get("/lots/:lotId/analytics", getAnalytics);

module.exports = router;
