
const {
    searchAvailableParking
} = require("./parking-search.service");

const searchParking = async (req, res) => {
    try {
        const { location, startTime, endTime } = req.query;

        // Convert query strings into Date objects
        const requestedStartTime = new Date(startTime);
        const requestedEndTime = new Date(endTime);

        // Call the search service
        const results = await searchAvailableParking(
            location.trim(),
            requestedStartTime,
            requestedEndTime
        );

        return res.status(200).json({
            success: true,
            message: "Available parking spaces fetched successfully",
            search: {
                location: location.trim(),
                startTime: requestedStartTime,
                endTime: requestedEndTime
            },
            data: results
        });

    } catch (error) {
        console.error("Parking search error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = {
    searchParking
};
