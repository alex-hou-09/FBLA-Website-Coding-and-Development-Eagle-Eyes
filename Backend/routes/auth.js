const express = require("express");
const router = express.Router();
const User = require("../models/User");

// POST /api/login
router.post("/login", async (req, res) => {
  try {
    const {email, id} = req.body;

    const user = await User.findOne({
      email: email,
      id: Number(id),
    });

    if (!user) return res.json({success: false});

    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      userType: user.userType,
      credits: user.userType === "Student" ? user.credits : 0,
    };

    res.json({
      success: true,
      redirect:
        user.userType === "Admin"
          ? "/Frontend/HTML/admin.html"
          : "/Frontend/HTML/user-homepage.html",
    });
  } catch (err) {
    res.status(500).json({success: false, error: err.message});
  }
});

// GET /api/current-user
router.get("/current-user", (req, res) => {
  res.json(req.session.user || null);
});

// POST /api/logout
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({success: false});
    res.json({success: true});
  });
});

module.exports = router;
