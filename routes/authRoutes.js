const router = require("express").Router();
const User = require("../models/User");
const Mechanic = require("../models/Mechanic");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const normalizeRole = (role) =>
  ["Customer", "Mechanic"].includes(role) ? role : "Customer";



// ✅ LOGIN (🔥 FIXED)
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    const match = await bcrypt.compare(req.body.password, user.password);

    if (!match) {
      return res.status(400).json({ msg: "Wrong password" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // ✅ SEND USER DATA ALSO (IMPORTANT FOR FRONTEND)
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: normalizeRole(user.role)
      }
    });

  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;

