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

const ParkingSlot = require("./parking-slot.model");

const createParkingSlot = async (req, res) => {
    try {
        const { slotNumber, parkingLot } = req.body;

        // 1. Validate required fields
        if (!slotNumber || !parkingLot) {
            return res.status(400).json({
                success: false,
                message: "slotNumber and parkingLot are required"
            });
        }

        // 2. Check whether parking lot exists
        const existingParkingLot = await ParkingLot.findById(parkingLot);

        if (!existingParkingLot) {
            return res.status(404).json({
                success: false,
                message: "Parking lot not found"
            });
        }

        // 3. Create parking slot
        const parkingSlot = await ParkingSlot.create({
            slotNumber,
            parkingLot
        });

        // 4. Send response
        return res.status(201).json({
            success: true,
            message: "Parking slot created successfully",
            data: parkingSlot
        });

    } catch (error) {
        console.error("Create parking slot error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const getParkingLots = async (req, res) => {
    try {
        const parkingLots = await ParkingLot.find();

        return res.status(200).json({
            success: true,
            message: "Parking lots fetched successfully",
            data: parkingLots
        });

    } catch (error) {
        console.error("Get parking lots error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
const getParkingSlots = async (req, res) => {
    try {
        const { lotId } = req.params;

        // 1. Check whether parking lot exists
        const parkingLot = await ParkingLot.findById(lotId);

        if (!parkingLot) {
            return res.status(404).json({
                success: false,
                message: "Parking lot not found"
            });
        }

        // 2. Find all slots belonging to this parking lot
        const parkingSlots = await ParkingSlot.find({
            parkingLot: lotId
        });

        return res.status(200).json({
            success: true,
            message: "Parking slots fetched successfully",
            data: parkingSlots
        });

    } catch (error) {
        console.error("Get parking slots error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const getParkingSlot = async (req, res) => {
    try {
        const { slotId } = req.params;

        const parkingSlot = await ParkingSlot.findById(slotId);

        if (!parkingSlot) {
            return res.status(404).json({
                success: false,
                message: "Parking slot not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Parking slot fetched successfully",
            data: parkingSlot
        });

    } catch (error) {
        console.error("Get parking slot error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const updateParkingSlotStatus = async (req, res) => {
    try {
        const { slotId } = req.params;
        const { status } = req.body;

        // 1. Validate status
        if (!status) {
            return res.status(400).json({
                success: false,
                message: "Status is required"
            });
        }

        // 2. Check whether status is valid
        const validStatuses = ["available", "occupied", "reserved"];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status"
            });
        }

        // 3. Find the parking slot
        const parkingSlot = await ParkingSlot.findById(slotId);

        if (!parkingSlot) {
            return res.status(404).json({
                success: false,
                message: "Parking slot not found"
            });
        }

        // 4. Update status
        parkingSlot.status = status;

        // 5. Save updated slot
        await parkingSlot.save();

        // 6. Send response
        return res.status(200).json({
            success: true,
            message: "Parking slot status updated successfully",
            data: parkingSlot
        });

    } catch (error) {
        console.error("Update parking slot status error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = {
    createParkingLot,
    createParkingSlot,
    getParkingLots,
    getParkingSlots,
    getParkingSlot,
    updateParkingSlotStatus
};