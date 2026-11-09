const ParkingSlot = require("./parking-slot.model");
const Booking = require("../booking/booking.model");

// Synchronize the current occupancy of a parking slot.
// This function must be called inside an existing transaction.
const syncSlotOccupancy = async (slotId, session) => {
    const now = new Date();

    // Check whether this slot has a currently active booking.
    const activeBooking = await Booking.findOne({
        parkingSlot: slotId,
        status: "active",
        startTime: { $lte: now },
        endTime: { $gt: now }
    }).session(session);

    const newStatus = activeBooking ? "occupied" : "available";

    const updatedSlot = await ParkingSlot.findByIdAndUpdate(
        slotId,
        {
            $set: { status: newStatus }
        },
        {
            new: true,
            session,
            runValidators: true
        }
    );

    if (!updatedSlot) {
        throw new Error("Parking slot not found during occupancy synchronization");
    }

    return updatedSlot;
};

module.exports = {
    syncSlotOccupancy
};