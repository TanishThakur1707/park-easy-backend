
const validateParkingSearch = (req, res, next) => {
    const { location, startTime, endTime } = req.query;

    // 1. Check required parameters
    if (!location || !startTime || !endTime) {
        return res.status(400).json({
            success: false,
            message: "Location, startTime and endTime are required"
        });
    }

    // 2. Validate location
    if (
        typeof location !== "string" ||
        !location.trim() ||
        location.trim().length > 100
    ) {
        return res.status(400).json({
            success: false,
            message: "Location must be a non-empty string of at most 100 characters"
        });
    }

    // 3. Convert dates
    const requestedStartTime = new Date(startTime);
    const requestedEndTime = new Date(endTime);

    // 4. Validate dates
    if (
        Number.isNaN(requestedStartTime.getTime()) ||
        Number.isNaN(requestedEndTime.getTime())
    ) {
        return res.status(400).json({
            success: false,
            message: "Invalid startTime or endTime"
        });
    }

    // 5. Validate time interval
    if (requestedEndTime <= requestedStartTime) {
        return res.status(400).json({
            success: false,
            message: "endTime must be after startTime"
        });
    }

    // 6. Prevent searches for past intervals
    if (requestedStartTime < new Date()) {
        return res.status(400).json({
            success: false,
            message: "Search start time cannot be in the past"
        });
    }

    next();
};

module.exports = {
    validateParkingSearch
};
