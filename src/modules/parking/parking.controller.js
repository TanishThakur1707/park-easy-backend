const ParkingLot = require("./parking-lot.model");

const createParkingLot = async (req, res) => {
    try {
        const { name, address, city, totalSlots } = req.body;

        // 1. Validate required fields
        if (!name || !address || !city || !totalSlots) {
            return res.status(400).json({
                success: false,
                message: "Name, address, city and totalSlots are required"
            });
        }

        // 2. Create parking lot
        const parkingLot = await ParkingLot.create({
            name,
            address,
            city,
            totalSlots
        });

        // 3. Send response
        return res.status(201).json({
            success: true,
            message: "Parking lot created successfully",
            data: parkingLot
        });

    } catch (error) {
        console.error("Create parking lot error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = {
    createParkingLot
};