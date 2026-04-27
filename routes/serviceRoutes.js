const router = require("express").Router();
const Service = require("../models/Service");
const Mechanic = require("../models/Mechanic");

const quoteTotal = (items = []) =>
  items.reduce((sum, item) => sum + Number(item.quantity || 1) * Number(item.price || 0), 0);

const pushTimeline = (service, status, note) => {
  service.timeline.push({ status, note });
};

const shouldReleaseMechanic = (status) =>
  ["Completed", "Cancelled", "Rejected"].includes(status);

const sendError = (res, err) => {
  const status = err.name === "ValidationError" ? 400 : 500;
  return res.status(status).json({ msg: err.message || "Service request failed" });
};

router.post("/", async (req, res) => {
  try {
    const service = new Service({
      ...req.body,
      cost: quoteTotal(req.body.quoteItems),
      timeline: [{ status: "Booked", note: "Service booking created" }]
    });
    await service.save();
    res.json(service);
  } catch (err) {
    sendError(res, err);
  }
});

router.get("/", async (req, res) => {
  const filter = {};

  if (req.query.customerEmail) {
    filter.customerEmail = req.query.customerEmail;
  }

  if (req.query.mechanicEmail) {
    const mechanic = await Mechanic.findOne({ email: req.query.mechanicEmail });
    filter.$or = [
      { mechanicId: mechanic?._id || null },
      { mechanicId: null, status: "Booked" }
    ];
  }

  const data = await Service.find(filter)
    .populate("vehicleId")
    .populate("mechanicId")
    .sort({ createdAt: -1 });
  res.json(data);
});

router.post("/:id/assign", async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ msg: "Service booking not found" });

    let mechanic = null;
    if (req.body.mechanicId) {
      mechanic = await Mechanic.findById(req.body.mechanicId);
    } else {
      mechanic = await Mechanic.findOne({
        status: "Available",
        $or: [{ skills: service.serviceType }, { skills: "General Service" }]
      }).sort({ currentWorkload: 1, rating: -1 });
    }

    if (!mechanic) return res.status(404).json({ msg: "No available mechanic found" });

    if (service.mechanicId && service.mechanicId.toString() !== mechanic._id.toString()) {
      await Mechanic.findByIdAndUpdate(service.mechanicId, {
        $inc: { currentWorkload: -1 },
        status: "Available"
      });
    }

    service.mechanicId = mechanic._id;
    service.status = "Assigned";
    service.mechanicLocation = {
      lat: mechanic.location?.lat,
      lng: mechanic.location?.lng,
      updatedAt: new Date()
    };
    pushTimeline(service, "Assigned", `${mechanic.name} assigned through smart dispatch`);

    mechanic.currentWorkload += 1;
    mechanic.status = "Busy";

    await mechanic.save();
    await service.save();
    res.json(await service.populate(["vehicleId", "mechanicId"]));
  } catch (err) {
    sendError(res, err);
  }
});

router.patch("/:id/status", async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ msg: "Service booking not found" });

    if (req.body.status) service.status = req.body.status;
    if (req.body.mechanicLocation) {
      service.mechanicLocation = { ...req.body.mechanicLocation, updatedAt: new Date() };
    }
    if (req.body.partsReplaced) service.partsReplaced = req.body.partsReplaced;
    if (req.body.taskChecklist) service.taskChecklist = req.body.taskChecklist;
    if (req.body.photos) service.photos = req.body.photos;
    if (req.body.paymentStatus) service.paymentStatus = req.body.paymentStatus;
    if (req.body.invoiceNumber) service.invoiceNumber = req.body.invoiceNumber;
    if (req.body.cost !== undefined) service.cost = Number(req.body.cost || 0);

    pushTimeline(service, service.status, req.body.note || "Status updated");
    await service.save();

    if (service.mechanicId && shouldReleaseMechanic(service.status)) {
      await Mechanic.findByIdAndUpdate(service.mechanicId, {
        $inc: { currentWorkload: -1 },
        status: "Available"
      });
    }

    res.json(await service.populate(["vehicleId", "mechanicId"]));
  } catch (err) {
    sendError(res, err);
  }
});

router.patch("/:id/quote", async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ msg: "Service booking not found" });

    service.quoteItems = req.body.quoteItems || [];
    service.cost = quoteTotal(service.quoteItems);
    service.quoteStatus = "Sent";
    service.status = "Quote Sent";
    pushTimeline(service, "Quote Sent", "Itemized quote sent for customer approval");

    await service.save();
    res.json(await service.populate(["vehicleId", "mechanicId"]));
  } catch (err) {
    sendError(res, err);
  }
});

router.patch("/:id/approval", async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ msg: "Service booking not found" });

    const approved = Boolean(req.body.approved);
    service.quoteStatus = approved ? "Approved" : "Rejected";
    service.status = approved ? "Approved" : "Rejected";
    pushTimeline(service, service.status, approved ? "Customer approved quote" : "Customer rejected quote");

    await service.save();
    res.json(await service.populate(["vehicleId", "mechanicId"]));
  } catch (err) {
    sendError(res, err);
  }
});

module.exports = router;
