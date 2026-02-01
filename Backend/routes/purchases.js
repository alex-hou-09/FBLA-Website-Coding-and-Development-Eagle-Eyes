const express = require("express");
const router = express.Router();
const {FILES, readJSON, writeJSON} = require("../helpers/fileHelpers");

// ===========================
// POST /api/user/purchase
// Deduct credits and record a purchase
// ===========================
router.post("/user/purchase", (req, res) => {
  const {itemKey, cost, email, id} = req.body;

  try {
    const usersData = readJSON(FILES.users, {users: []});

    const user = usersData.users.find(
      (u) =>
        u.email === email &&
        String(u.id) === String(id) &&
        u.userType === "Student",
    );

    if (!user) {
      return res.json({success: false, error: "User not found"});
    }

    const currentCredits = user.credits || 0;
    if (currentCredits < cost) {
      return res.json({success: false, error: "Insufficient credits"});
    }

    user.credits = currentCredits - cost;
    writeJSON(FILES.users, usersData);

    const purchasedData = readJSON(FILES.purchased, {
      candy: [],
      tickets: [],
      cards: [],
    });

    purchasedData[itemKey].push({
      email: email,
      ID: id,
      purchasedAt: new Date().toISOString(),
    });

    writeJSON(FILES.purchased, purchasedData);

    // Keep session in sync
    if (req.session.user) {
      req.session.user.credits = user.credits;
    }

    res.json({success: true, newCredits: user.credits});
  } catch (error) {
    console.error("Purchase error:", error);
    res.json({success: false, error: error.message});
  }
});

// ===========================
// GET /api/purchases
// Admin: view all purchases
// ===========================
router.get("/purchases", (req, res) => {
  const purchasedData = readJSON(FILES.purchased, {
    candy: [],
    tickets: [],
    cards: [],
  });
  res.json(purchasedData);
});

// ===========================
// POST /api/purchases/fulfill
// Admin: mark a purchase as fulfilled (removes it from the list)
// ===========================
router.post("/purchases/fulfill", (req, res) => {
  const {itemKey, email, id, purchasedAt} = req.body;

  if (!itemKey || !email || !id || !purchasedAt) {
    return res
      .status(400)
      .json({success: false, error: "Missing required fields"});
  }

  const purchasedData = readJSON(FILES.purchased, {
    candy: [],
    tickets: [],
    cards: [],
  });

  if (!purchasedData[itemKey]) {
    return res.status(400).json({success: false, error: "Invalid item key"});
  }

  purchasedData[itemKey] = purchasedData[itemKey].filter(
    (p) =>
      !(
        p.email === email &&
        String(p.ID) === String(id) &&
        p.purchasedAt === purchasedAt
      ),
  );

  writeJSON(FILES.purchased, purchasedData);
  res.json({success: true});
});

module.exports = router;
