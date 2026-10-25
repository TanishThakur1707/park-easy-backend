const express = require("express");
const { createParkingLot } = require("./parking.controller");

const router = express.Router();

router.post("/lots", createParkingLot);

module.exports = router;