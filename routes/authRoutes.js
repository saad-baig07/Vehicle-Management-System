const router = require("express").Router();
const User = require("../models/User");
const Mechanic = require("../models/Mechanic");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const normalizeRole = (role) =>
  ["Customer", "Mechanic", "Admin"].includes(role) ? role : "Admin";


// ✅ REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // hash password
    const hash = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hash,
      phone,
      role: role || "Customer"
    });

    await user.save();

    if (user.role === "Mechanic") {
      const existingMechanic = await Mechanic.findOne({ email: user.email });
      if (!existingMechanic) {
        await new Mechanic({
          name: user.name,
          email: user.email,
          phone: user.phone,
          skills: ["General Service"],
          status: "Available"
        }).save();
      }
    }

    res.json({
      msg: "User registered successfully",
      user: {
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


// ✅ GET ALL USERS
router.get("/users", async (req, res) => {
  const users = await User.find();
  res.json(users);
});


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
