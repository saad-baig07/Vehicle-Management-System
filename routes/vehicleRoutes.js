const router = require("express").Router();
const Vehicle = require("../models/Vehicle");

// CREATE
router.post("/", async (req, res) => {
  const v = new Vehicle(req.body);
  await v.save();
  res.json(v);
});

// GET
router.get("/", async (req, res) => {
  const filter = {};
  if (req.query.ownerEmail) filter.ownerEmail = req.query.ownerEmail;
  res.json(await Vehicle.find(filter));
});

// DELETE
router.delete("/:id", async (req, res) => {
  await Vehicle.findByIdAndDelete(req.params.id);
  res.json({ msg: "Deleted" });
});

module.exports = router;
