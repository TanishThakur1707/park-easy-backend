const mongoose = require("mongoose");

const parkingLotSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        address: {
            type: String,
            required: true,
            trim: true
        },

        city: {
            type: String,
            required: true,
            trim: true
        },

        totalSlots: {
            type: Number,
            required: true,
            min: 1
        },

        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active"
        }
    },
    {
        timestamps: true
    }
);

const ParkingLot = mongoose.model("ParkingLot", parkingLotSchema);

module.exports = ParkingLot;