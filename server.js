require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// ✅ ROUTES
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/vehicles", require("./routes/vehicleRoutes"));
app.use("/api/rentals", require("./routes/rentalRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/services", require("./routes/serviceRoutes"));
app.use("/api/mechanics", require("./routes/mechanicRoutes"));
app.use("/api/sos", require("./routes/sosRoutes"));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

app.listen(process.env.PORT, () => {
  console.log("Server running on port " + process.env.PORT);
});
