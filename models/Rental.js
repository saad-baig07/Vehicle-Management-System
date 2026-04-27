const mongoose = require("mongoose");

const rentalSchema = new mongoose.Schema({
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" },
  startTime: Date,
  endTime: Date,
  totalCost: Number
});

module.exports = mongoose.model("Rental", rentalSchema);