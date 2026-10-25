const express = require("express");
const { registerUser } = require("./auth.controller");

const router = express.Router();

router.post("/register", registerUser);

module.exports = router;