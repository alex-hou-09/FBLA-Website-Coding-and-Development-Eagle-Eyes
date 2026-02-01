const express = require("express");
const router = express.Router();
const {FILES, readJSON} = require("../helpers/fileHelpers");

// POST /api/login
router.post("/login", (req, res) => {
  const {email, id} = req.body;
  const data = readJSON(FILES.users, {users: []});

  const user = data.users.find(
    (u) => u.email === email && String(u.id) === String(id),
  );
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
