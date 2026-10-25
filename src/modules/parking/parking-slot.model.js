const mongoose = require("mongoose");

const parkingSlotSchema = new mongoose.Schema(
    {
        slotNumber: {
            type: String,
            required: true,
            trim: true
        },

        parkingLot: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ParkingLot",
            required: true
        },

        status: {
            type: String,
            enum: ["available", "occupied", "reserved"],
            default: "available"
        }
    },
    {
        timestamps: true
    }
);

const ParkingSlot = mongoose.model("ParkingSlot", parkingSlotSchema);

module.exports = ParkingSlot;