
const ParkingLot = require("./parking-lot.model");
const ParkingSlot = require("./parking-slot.model");
const Booking = require("../booking/booking.model");

// Find parking lots and slots available for a requested time interval
const searchAvailableParking = async (location, startTime, endTime) => {

    // 1. Find active parking lots matching the location
    const escapedLocation = location.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const parkingLots = await ParkingLot.find({
        status: "active",
        $or: [
            { name: { $regex: escapedLocation, $options: "i" } },
            { address: { $regex: escapedLocation, $options: "i" } },
            { city: { $regex: escapedLocation, $options: "i" } }
        ]
    })
        .select("name address city totalSlots")
        .lean();

    if (parkingLots.length === 0) {
        return [];
    }

    // 2. Get IDs of matching parking lots
    const parkingLotIds = parkingLots.map(lot => lot._id);

    // 3. Find all slots belonging to these parking lots
    const parkingSlots = await ParkingSlot.find({
        parkingLot: { $in: parkingLotIds }
    })
        .select("slotNumber parkingLot")
        .lean();

    if (parkingSlots.length === 0) {
        return [];
    }

    // 4. Get all slot IDs
    const parkingSlotIds = parkingSlots.map(slot => slot._id);

    // 5. Find bookings that overlap with the requested time
    const conflictingBookings = await Booking.find({
        parkingSlot: { $in: parkingSlotIds },
        status: { $in: ["reserved", "active"] },
        startTime: { $lt: endTime },
        endTime: { $gt: startTime }
    })
        .select("parkingSlot")
        .lean();

    // 6. Store unavailable slot IDs in a Set
    const unavailableSlotIds = new Set(
        conflictingBookings.map(booking =>
            booking.parkingSlot.toString()
        )
    );

    // 7. Group available slots by parking lot
    const results = [];

    for (const lot of parkingLots) {

        const lotSlots = parkingSlots.filter(
            slot => slot.parkingLot.toString() === lot._id.toString()
        );

        const availableSlots = lotSlots
            .filter(slot =>
                !unavailableSlotIds.has(slot._id.toString())
            )
            .map(slot => ({
                _id: slot._id,
                slotNumber: slot.slotNumber,
                status: "available"
            }));

        // Only return lots that have available slots
        if (availableSlots.length > 0) {
            results.push({
                parkingLot: {
                    _id: lot._id,
                    name: lot.name,
                    address: lot.address,
                    city: lot.city,
                    totalSlots: lot.totalSlots
                },
                availableSlots,
                availableSlotCount: availableSlots.length
            });
        }
    }

    return results;
};

module.exports = {
    searchAvailableParking
};
