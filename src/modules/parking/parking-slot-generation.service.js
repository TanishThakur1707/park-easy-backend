
const ParkingLot = require("./parking-lot.model");
const ParkingSlot = require("./parking-slot.model");

const generateParkingSlots = async (lotId) => {

    // 1. Find the parking lot
    const parkingLot = await ParkingLot.findById(lotId)
        .select("_id totalSlots")
        .lean();

    if (!parkingLot) {
        return null;
    }

    // 2. Validate configured capacity
    if (
        !Number.isSafeInteger(parkingLot.totalSlots) ||
        parkingLot.totalSlots < 1
    ) {
        throw new Error("Parking lot capacity must be a positive integer");
    }

    // 3. Generate expected slot numbers
    const slotNumbers = Array.from(
        { length: parkingLot.totalSlots },
        (_, index) => `A${String(index + 1).padStart(2, "0")}`
    );

    // 4. Prepare bulk upsert operations
    const operations = slotNumbers.map(slotNumber => ({
        updateOne: {
            filter: {
                parkingLot: parkingLot._id,
                slotNumber
            },
            update: {
                $setOnInsert: {
                    parkingLot: parkingLot._id,
                    slotNumber
                }
            },
            upsert: true
        }
    }));

    // 5. Execute all operations together
    const result = await ParkingSlot.bulkWrite(
        operations,
        { ordered: false }
    );

    // 6. Count generated slots
    const totalGeneratedSlots = await ParkingSlot.countDocuments({
        parkingLot: parkingLot._id,
        slotNumber: { $in: slotNumbers }
    });

    return {
        parkingLot: parkingLot._id,
        totalCapacity: parkingLot.totalSlots,
        existingSlots: totalGeneratedSlots - result.upsertedCount,
        createdSlots: result.upsertedCount,
        totalSlots: totalGeneratedSlots
    };
};

module.exports = { generateParkingSlots };
