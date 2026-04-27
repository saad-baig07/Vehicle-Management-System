const router = require("express").Router();
const Vehicle = require("../models/Vehicle");
const User = require("../models/User");
const Rental = require("../models/Rental");
const Service = require("../models/Service");
const Mechanic = require("../models/Mechanic");
const SosRequest = require("../models/SosRequest");

router.get("/", async (req, res) => {
  const totalVehicles = await Vehicle.countDocuments();
  const totalUsers = await User.countDocuments();
  const totalRentals = await Rental.countDocuments();
  const totalBookings = await Service.countDocuments();
  const activeServices = await Service.countDocuments({
    status: { $in: ["Booked", "Assigned", "Inspection", "Quote Sent", "Approved", "Repairing"] }
  });
  const pendingQuotes = await Service.countDocuments({ quoteStatus: "Sent" });
  const openSos = await SosRequest.countDocuments({ status: { $in: ["Open", "Dispatched"] } });
  const availableMechanics = await Mechanic.countDocuments({ status: "Available" });
  const revenue = await Service.aggregate([
    { $match: { paymentStatus: "Paid" } },
    { $group: { _id: null, total: { $sum: "$cost" } } }
  ]);

  res.json({
    totalVehicles,
    totalUsers,
    totalRentals,
    totalBookings,
    activeServices,
    pendingQuotes,
    openSos,
    availableMechanics,
    revenue: revenue[0]?.total || 0
  });
});

module.exports = router;
