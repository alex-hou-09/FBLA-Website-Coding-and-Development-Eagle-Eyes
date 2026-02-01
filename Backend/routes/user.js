const express = require("express");
const router = express.Router();

const Pending = require("../models/Pending");
const ItemClaim = require("../models/ItemClaim");
const Item = require("../models/Item");
const ClaimedItem = require("../models/ClaimedItem");
const ContactAnswered = require("../models/ContactAnswered");
const User = require("../models/User");

// ===========================
// GET /api/user/item-claims
// ===========================
router.get("/user/item-claims", async (req, res) => {
  try {
    if (!req.session.user || !req.session.user.email) {
      return res.status(401).json({success: false, error: "Not logged in"});
    }

    const userEmail = req.session.user.email.toLowerCase();
    const userID = String(req.session.user.id);

    // Pending item-claims for this user
    const pendingClaims = await Pending.find({
      typeOfSubmission: "item-claim",
      $or: [
        {studentEmail: {$regex: new RegExp(`^${userEmail}$`, "i")}},
        {studentID: userID},
      ],
    });

    // Approved item-claims for this user
    const approvedClaims = await ItemClaim.find({
      typeOfSubmission: "item-claim",
      $or: [
        {studentEmail: {$regex: new RegExp(`^${userEmail}$`, "i")}},
        {studentID: userID},
      ],
    });

    const claims = [
      ...pendingClaims.map((c) => ({...c.toObject(), status: "Pending"})),
      ...approvedClaims.map((c) => ({...c.toObject(), status: "Approved"})),
    ];

    res.json({success: true, claims});
  } catch (err) {
    res.status(500).json({success: false, error: err.message});
  }
});

// ===========================
// DELETE /api/item-claims/:itemID/:email
// ===========================
router.delete("/item-claims/:itemID/:email", async (req, res) => {
  try {
    const itemID = req.params.itemID;
    const decodedEmail = decodeURIComponent(req.params.email);

    const result = await ItemClaim.deleteOne({
      itemID: itemID,
      studentEmail: decodedEmail,
      status: "Approved",
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({success: false, error: "Claim not found."});
    }

    res.json({success: true});
  } catch (err) {
    res.status(500).json({success: false, error: err.message});
  }
});

// ===========================
// GET /api/user/turned-in-items
// ===========================
router.get("/user/turned-in-items", async (req, res) => {
  try {
    if (!req.session.user) return res.status(401).json({success: false});

    const userEmail = req.session.user.email.toLowerCase();
    const userID = String(req.session.user.id);

    const emailMatch = {$regex: new RegExp(`^${userEmail}$`, "i")};
    const userFilter = {
      $or: [{submitterEmail: emailMatch}, {submitterID: userID}],
    };

    // Pending found-reports
    const pendingReports = await Pending.find({
      typeOfSubmission: "found-report",
      $or: [{studentEmail: emailMatch}, {studentID: userID}],
    });

    // Active items waiting to be claimed
    const waitingReports = await Item.find(userFilter);

    // Already claimed items
    const claimedReports = await ClaimedItem.find(userFilter);

    res.json({
      success: true,
      reports: [
        ...pendingReports.map((r) => ({...r.toObject(), status: "Pending"})),
        ...waitingReports.map((r) => ({...r.toObject(), status: "Waiting"})),
        ...claimedReports.map((r) => ({...r.toObject(), status: "Claimed"})),
      ],
    });
  } catch (err) {
    res.status(500).json({success: false, error: err.message});
  }
});

// ===========================
// DELETE /api/claimed-items/:id
// ===========================
router.delete("/claimed-items/:id", async (req, res) => {
  try {
    const result = await ClaimedItem.deleteOne({id: req.params.id});

    if (result.deletedCount === 0) {
      return res.status(404).json({success: false});
    }

    res.json({success: true});
  } catch (err) {
    res.status(500).json({success: false, error: err.message});
  }
});

// ===========================
// GET /api/user/contact-responses
// ===========================
router.get("/user/contact-responses", async (req, res) => {
  try {
    if (!req.session.user) return res.status(401).json({success: false});

    const userEmail = req.session.user.email.toLowerCase();
    const userID = String(req.session.user.id);

    const responses = await ContactAnswered.find({
      $or: [
        {email: {$regex: new RegExp(`^${userEmail}$`, "i")}},
        {studentId: userID},
      ],
    });

    res.json({success: true, responses});
  } catch (err) {
    res.status(500).json({success: false, error: err.message});
  }
});

// ===========================
// DELETE /api/contact-responses/:email/:subject
// ===========================
router.delete("/contact-responses/:email/:subject", async (req, res) => {
  try {
    const decodedEmail = decodeURIComponent(req.params.email);
    const decodedSubject = decodeURIComponent(req.params.subject);

    const result = await ContactAnswered.deleteOne({
      email: decodedEmail,
      subject: decodedSubject,
    });

    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({success: false, error: "Response not found"});
    }

    res.json({success: true});
  } catch (err) {
    res.status(500).json({success: false, error: err.message});
  }
});

// ===========================
// GET /api/user/credits
// ===========================
router.get("/user/credits", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({success: false});
    }

    const user = await User.findOne({
      id: Number(req.session.user.id),
      email: req.session.user.email,
      userType: "Student",
    });

    if (!user) return res.json({success: false});

    res.json({success: true, credits: user.credits});
  } catch (err) {
    res.status(500).json({success: false, error: err.message});
  }
});

module.exports = router;
