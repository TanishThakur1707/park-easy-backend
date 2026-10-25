const express = require("express");
const { protect } = require("../../middleware/auth.middleware");
const { registerUser, loginUser } = require("./auth.controller");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, (req, res) => {
    res.status(200).json({
        success: true,
        message: "You are authenticated",
        user: req.user
    });
});

module.exports = router;