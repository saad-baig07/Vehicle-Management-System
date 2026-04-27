const mongoose = require("mongoose");

const mechanicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: String,
  phone: String,
  skills: [String],
  currentWorkload: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ["Available", "Busy", "Offline"],
    default: "Available"
  },
  location: {
    lat: Number,
    lng: Number,
    area: String
  },
  rating: { type: Number, default: 5 }
});

module.exports = mongoose.model("Mechanic", mechanicSchema);
