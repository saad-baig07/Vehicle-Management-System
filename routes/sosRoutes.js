const router = require("express").Router();
const SosRequest = require("../models/SosRequest");
const Mechanic = require("../models/Mechanic");

router.post("/", async (req, res) => {
  const mechanic = await Mechanic.findOne({ status: "Available" }).sort({
    currentWorkload: 1,
    rating: -1
  });

  const sos = new SosRequest({
    ...req.body,
    assignedMechanic: mechanic?._id,
    status: mechanic ? "Dispatched" : "Open"
  });

  if (mechanic) {
    mechanic.status = "Busy";
    mechanic.currentWorkload += 1;
    await mechanic.save();
  }

  await sos.save();
  res.json(await sos.populate("assignedMechanic"));
});

router.get("/", async (req, res) => {
  res.json(await SosRequest.find().populate("assignedMechanic").sort({ createdAt: -1 }));
});

router.patch("/:id", async (req, res) => {
  const sos = await SosRequest.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate("assignedMechanic");
  if (!sos) return res.status(404).json({ msg: "SOS request not found" });
  res.json(sos);
});

module.exports = router;
