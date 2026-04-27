const router = require("express").Router();
const Mechanic = require("../models/Mechanic");

router.post("/", async (req, res) => {
  const mechanic = new Mechanic(req.body);
  await mechanic.save();
  res.json(mechanic);
});

router.get("/", async (req, res) => {
  res.json(await Mechanic.find().sort({ status: 1, currentWorkload: 1 }));
});

router.patch("/:id", async (req, res) => {
  const mechanic = await Mechanic.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!mechanic) return res.status(404).json({ msg: "Mechanic not found" });
  res.json(mechanic);
});

router.delete("/:id", async (req, res) => {
  await Mechanic.findByIdAndDelete(req.params.id);
  res.json({ msg: "Mechanic deleted" });
});

module.exports = router;
