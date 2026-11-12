
const mongoose = require("mongoose");

const {
    getParkingAnalytics
} = require("./parking-analytics.service");

const getAnalytics = async (req, res) => {
    try {
        const { lotId } = req.params;

        // 1. Validate lot ID
        if (!mongoose.Types.ObjectId.isValid(lotId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid parking lot ID"
            });
        }

        // 2. Fetch analytics
        const analytics = await getParkingAnalytics(lotId);

        // 3. Check parking lot existence
        if (!analytics) {
            return res.status(404).json({
                success: false,
                message: "Parking lot not found"
            });
        }

        // 4. Return response
        return res.status(200).json({
            success: true,
            message: "Parking analytics fetched successfully",
            data: analytics
        });

    } catch (error) {
        console.error("Parking analytics error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = { getAnalytics };
