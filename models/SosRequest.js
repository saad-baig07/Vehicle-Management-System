const mongoose = require("mongoose");

const sosRequestSchema = new mongoose.Schema({
  customerName: String,
  phone: String,
  vehicleRegNumber: String,
  issue: String,
  location: {
    lat: Number,
    lng: Number,
    address: String
  },
  assignedMechanic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Mechanic"
  },
  status: {
    type: String,
    enum: ["Open", "Dispatched", "Resolved", "Cancelled"],
    default: "Open"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("SosRequest", sosRequestSchema);
