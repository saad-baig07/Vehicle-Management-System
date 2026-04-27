const mongoose = require("mongoose");

const quoteItemSchema = new mongoose.Schema(
  {
    name: String,
    quantity: { type: Number, default: 1 },
    price: { type: Number, default: 0 }
  },
  { _id: false }
);

const timelineSchema = new mongoose.Schema(
  {
    status: String,
    note: String,
    time: { type: Date, default: Date.now }
  },
  { _id: false }
);

const photoSchema = new mongoose.Schema(
  {
    label: String,
    url: String
  },
  { _id: false }
);

const serviceTypeValues = [
  "General Service",
  "Engine Issue",
  "Oil Change",
  "Puncture Repair",
  "Battery Check",
  "Brake Repair",
  "Emergency SOS",
  "Other"
];

const normalizeServiceType = (value) => {
  if (!value) return "General Service";

  const normalized = String(value).trim().toLowerCase();
  const match = serviceTypeValues.find((type) => type.toLowerCase() === normalized);

  if (match) return match;
  if (normalized.includes("engine")) return "Engine Issue";
  if (normalized.includes("oil")) return "Oil Change";
  if (normalized.includes("puncture")) return "Puncture Repair";
  if (normalized.includes("battery")) return "Battery Check";
  if (normalized.includes("brake")) return "Brake Repair";
  if (normalized.includes("sos") || normalized.includes("emergency")) return "Emergency SOS";

  return "Other";
};

const serviceSchema = new mongoose.Schema({
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vehicle"
  },
  customerName: String,
  customerPhone: String,
  customerEmail: String,
  issueDescription: String,
  serviceType: {
    type: String,
    enum: serviceTypeValues,
    set: normalizeServiceType,
    default: "General Service"
  },
  visitType: {
    type: String,
    enum: ["Doorstep", "Workshop"],
    default: "Workshop"
  },
  scheduledAt: Date,
  address: String,
  location: {
    lat: Number,
    lng: Number
  },
  status: {
    type: String,
    enum: ["Booked", "Assigned", "Inspection", "Quote Sent", "Approved", "Repairing", "Ready for Pickup", "Completed", "Rejected", "Cancelled"],
    default: "Booked"
  },
  mechanicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Mechanic"
  },
  mechanicLocation: {
    lat: Number,
    lng: Number,
    updatedAt: Date
  },
  quoteItems: [quoteItemSchema],
  quoteStatus: {
    type: String,
    enum: ["Pending", "Sent", "Approved", "Rejected"],
    default: "Pending"
  },
  cost: { type: Number, default: 0 },
  partsReplaced: [String],
  invoiceNumber: String,
  paymentStatus: {
    type: String,
    enum: ["Unpaid", "Paid", "Refunded"],
    default: "Unpaid"
  },
  taskChecklist: [String],
  photos: [photoSchema],
  timeline: [timelineSchema],
  nextServiceDate: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

serviceSchema.pre("validate", function normalizeServiceFields() {
  this.serviceType = normalizeServiceType(this.serviceType);
});

module.exports = mongoose.model("Service", serviceSchema);
