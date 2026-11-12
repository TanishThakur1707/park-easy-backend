
const ParkingLot = require("./parking-lot.model");
const ParkingSlot = require("./parking-slot.model");
const Booking = require("../booking/booking.model");

const getParkingAnalytics = async (lotId) => {

    // 1. Find parking lot
    const parkingLot = await ParkingLot.findById(lotId)
        .select("name city totalSlots")
        .lean();

    if (!parkingLot) {
        return null;
    }

    // 2. Get all registered slots
    const slots = await ParkingSlot.find({
        parkingLot: lotId
    })
        .select("_id")
        .lean();

    const slotIds = slots.map(slot => slot._id);

    const now = new Date();

    // 3. Find slots occupied at the current time
    const occupiedSlotIds = slotIds.length > 0
        ? await Booking.distinct("parkingSlot", {
            parkingSlot: { $in: slotIds },
            status: { $in: ["reserved", "active"] },
            startTime: { $lte: now },
            endTime: { $gt: now }
        })
        : [];

    // 4. Count upcoming reservations
    const upcomingReservations = slotIds.length > 0
        ? await Booking.countDocuments({
            parkingSlot: { $in: slotIds },
            status: "reserved",
            startTime: { $gt: now },
            endTime: { $gt: now }
        })
        : 0;

    // 5. Find distinct slots with upcoming reservations
    const upcomingSlotIds = slotIds.length > 0
        ? await Booking.distinct("parkingSlot", {
            parkingSlot: { $in: slotIds },
            status: "reserved",
            startTime: { $gt: now },
            endTime: { $gt: now }
        })
        : [];

    // 6. Calculate analytics
    const totalCapacity = parkingLot.totalSlots;
    const registeredSlots = slots.length;

    const occupiedNow = occupiedSlotIds.length;

    const availableNow = Math.max(
        registeredSlots - occupiedNow,
        0
    );

    const ungeneratedSlots = Math.max(
        totalCapacity - registeredSlots,
        0
    );

    const occupancyRate = registeredSlots > 0
        ? Number(((occupiedNow / registeredSlots) * 100).toFixed(2))
        : 0;

    const availabilityRate = registeredSlots > 0
        ? Number(((availableNow / registeredSlots) * 100).toFixed(2))
        : 0;

    // 7. Return analytics
    return {
        parkingLot: {
            id: parkingLot._id,
            name: parkingLot.name,
            city: parkingLot.city
        },

        asOf: now,

        totalCapacity,
        registeredSlots,
        ungeneratedSlots,

        occupiedNow,
        availableNow,

        upcomingReservations,
        slotsWithUpcomingReservations: upcomingSlotIds.length,

        occupancyRate,
        availabilityRate
    };
};

module.exports = { getParkingAnalytics };
