const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema({
  ownerName: String,
  ownerPhone: String,
  ownerEmail: String,
  regNumber: String,
  vehicleType: String,
  makeModel: String,
  fuelType: String,
  odometer: Number,
  lastServiceDate: Date,
  nextServiceDate: Date,
  status: { type: String, default: "Active" }
});

module.exports = mongoose.model("Vehicle", vehicleSchema);
