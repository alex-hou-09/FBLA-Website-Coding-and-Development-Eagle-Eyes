const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Purchase = require("../models/Purchase");

router.post("/user/purchase", async (req, res) => {
  try {
    const {itemKey, cost, email, id} = req.body;

    const user = await User.findOne({
      email: email,
      id: Number(id),
      userType: "Student",
    });

    if (!user) {
      return res.json({success: false, error: "User not found"});
    }

    const currentCredits = user.credits || 0;
    if (currentCredits < cost) {
      return res.json({success: false, error: "Insufficient credits"});
    }

    // deduct credits
    user.credits = currentCredits - cost;
    await user.save();

    // record purchase
    await Purchase.create({
      itemKey,
      email,
      ID: Number(id),
      purchasedAt: new Date().toISOString(),
    });

    if (req.session.user) {
      req.session.user.credits = user.credits;
    }

    res.json({success: true, newCredits: user.credits});
  } catch (err) {
    console.error("Purchase error:", err);
    res.json({success: false, error: err.message});
  }
});

router.get("/purchases", async (req, res) => {
  try {
    const all = await Purchase.find({});

    const grouped = {candy: [], tickets: [], cards: []};
    for (const p of all) {
      grouped[p.itemKey].push({
        email: p.email,
        ID: p.ID,
        purchasedAt: p.purchasedAt,
      });
    }

    res.json(grouped);
  } catch (err) {
    res.status(500).json({success: false, error: err.message});
  }
});

router.post("/purchases/fulfill", async (req, res) => {
  try {
    const {itemKey, email, id, purchasedAt} = req.body;

    if (!itemKey || !email || !id || !purchasedAt) {
      return res
        .status(400)
        .json({success: false, error: "Missing required fields"});
    }

    const result = await Purchase.deleteOne({
      itemKey,
      email,
      ID: Number(id),
      purchasedAt,
    });

    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({success: false, error: "Purchase not found"});
    }

    res.json({success: true});
  } catch (err) {
    res.status(500).json({success: false, error: err.message});
  }
});

module.exports = router;
