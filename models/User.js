const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  phone: String,
  role: {
    type: String,
    enum: ["Customer", "Mechanic", "Admin"],
    default: "Customer"
  }
});

module.exports = mongoose.model("User", userSchema);
