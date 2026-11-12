
const mongoose = require("mongoose");

const {
    generateParkingSlots
} = require("./parking-slot-generation.service");

const generateSlots = async (req, res) => {
    try {
        const { lotId } = req.params;

        // 1. Validate parking lot ID
        if (!mongoose.Types.ObjectId.isValid(lotId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid parking lot ID"
            });
        }

        // 2. Generate missing slots
        const result = await generateParkingSlots(lotId);

        // 3. Check whether parking lot exists
        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Parking lot not found"
            });
        }

        // 4. Return generation summary
        return res.status(200).json({
            success: true,
            message: "Parking slot generation completed successfully",
            data: result
        });

    } catch (error) {
        console.error("Generate parking slots error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = { generateSlots };
