
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
        },

        // Used to serialize concurrent booking attempts for this slot
        bookingVersion: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

const ParkingSlot = mongoose.model("ParkingSlot", parkingSlotSchema);

module.exports = ParkingSlot;
