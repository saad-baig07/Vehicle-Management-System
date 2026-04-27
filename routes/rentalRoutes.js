const router = require("express").Router();
const Rental = require("../models/Rental");

// START RENTAL
router.post("/start", async (req, res) => {
  const existing = await Rental.findOne({
    vehicleId: req.body.vehicleId,
    endTime: null
  });

  if (existing) return res.json({ msg: "Vehicle already rented!" });

  const rental = new Rental({
    vehicleId: req.body.vehicleId,
    startTime: new Date()
  });

  await rental.save();
  res.json(rental);
});

// END RENTAL
router.post("/end/:id", async (req, res) => {
  const rental = await Rental.findById(req.params.id).populate("vehicleId");

  if (!rental) return res.json({ msg: "Rental not found" });
  if (rental.endTime) return res.json({ msg: "Already ended" });

  rental.endTime = new Date();

  const hours = (rental.endTime - rental.startTime) / (1000 * 60 * 60);
  rental.totalCost = Math.ceil(hours) * rental.vehicleId.rentPerHour;

  await rental.save();
  res.json(rental);
});

// GET ALL RENTALS
router.get("/", async (req, res) => {
  const rentals = await Rental.find().populate("vehicleId");
  res.json(rentals);
});

module.exports = router;