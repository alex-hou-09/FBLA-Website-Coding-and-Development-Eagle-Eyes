const express = require("express");
const router = express.Router();
const {FILES, readJSON, writeJSON} = require("../helpers/fileHelpers");

// ===========================
// GET /api/user/item-claims
// Returns the logged-in user's pending + approved item claims
// ===========================
router.get("/user/item-claims", (req, res) => {
  if (!req.session.user || !req.session.user.email) {
    return res.status(401).json({success: false, error: "Not logged in"});
  }

  const userEmail = req.session.user.email.toLowerCase();
  const userID = String(req.session.user.id);

  const pendingData = readJSON(FILES.pending, {pending: []});
  const approvedData = readJSON(FILES.itemClaims, {claims: []});

  const pendingClaims = pendingData.pending
    .filter(
      (c) =>
        c.typeOfSubmission === "item-claim" &&
        (c.studentEmail.toLowerCase() === userEmail ||
          String(c.studentID) === userID),
    )
    .map((c) => ({...c, status: "Pending"}));

  const approvedClaims = approvedData.claims
    .filter(
      (c) =>
        c.typeOfSubmission === "item-claim" &&
        (c.studentEmail.toLowerCase() === userEmail ||
          String(c.studentID) === userID),
    )
    .map((c) => ({...c, status: "Approved"}));

  res.json({success: true, claims: [...pendingClaims, ...approvedClaims]});
});

// DELETE /api/item-claims/:itemID/:email
router.delete("/item-claims/:itemID/:email", (req, res) => {
  const {itemID, email} = req.params;
  const decodedEmail = decodeURIComponent(email);

  const data = readJSON(FILES.itemClaims, {claims: []});
  const originalLength = data.claims.length;

  data.claims = data.claims.filter(
    (c) =>
      !(
        String(c.itemID) === String(itemID) &&
        c.studentEmail === decodedEmail &&
        c.status === "Approved"
      ),
  );

  if (data.claims.length === originalLength) {
    return res.status(404).json({success: false, error: "Claim not found."});
  }

  writeJSON(FILES.itemClaims, data);
  res.json({success: true});
});

// ===========================
// GET /api/user/turned-in-items
// Shows items the logged-in user has submitted (pending / waiting / claimed)
// ===========================
router.get("/user/turned-in-items", (req, res) => {
  if (!req.session.user) return res.status(401).json({success: false});

  const userEmail = req.session.user.email.toLowerCase();
  const userID = String(req.session.user.id);

  const pendingData = readJSON(FILES.pending, {pending: []});
  const pendingReports = pendingData.pending
    .filter(
      (r) =>
        r.typeOfSubmission === "found-report" &&
        (r.studentEmail.toLowerCase() === userEmail ||
          String(r.studentID) === userID),
    )
    .map((r) => ({...r, status: "Pending"}));

  const itemsData = readJSON(FILES.items, {items: []});
  const waitingReports = itemsData.items
    .filter(
      (item) =>
        item.submitterEmail?.toLowerCase() === userEmail ||
        String(item.submitterID) === userID,
    )
    .map((item) => ({...item, status: "Waiting"}));

  const claimedData = readJSON(FILES.claimedItems, {claimedItems: []});
  const claimedReports = claimedData.claimedItems
    .filter(
      (item) =>
        item.submitterEmail?.toLowerCase() === userEmail ||
        String(item.submitterID) === userID,
    )
    .map((item) => ({...item, status: "Claimed"}));

  res.json({
    success: true,
    reports: [...pendingReports, ...waitingReports, ...claimedReports],
  });
});

// DELETE /api/claimed-items/:id
router.delete("/claimed-items/:id", (req, res) => {
  const id = String(req.params.id);
  const data = readJSON(FILES.claimedItems, {claimedItems: []});
  const originalLength = data.claimedItems.length;

  data.claimedItems = data.claimedItems.filter(
    (item) => String(item.id) !== id,
  );

  if (data.claimedItems.length === originalLength) {
    return res.status(404).json({success: false});
  }

  writeJSON(FILES.claimedItems, data);
  res.json({success: true});
});

// ===========================
// GET /api/user/contact-responses
// ===========================
router.get("/user/contact-responses", (req, res) => {
  if (!req.session.user) return res.status(401).json({success: false});

  const userEmail = req.session.user.email.toLowerCase();
  const userID = String(req.session.user.id);

  const answeredData = readJSON(FILES.contactAnswered, {messages: []});
  const userResponses = answeredData.messages.filter(
    (msg) =>
      msg.email.toLowerCase() === userEmail || String(msg.studentId) === userID,
  );

  res.json({success: true, responses: userResponses});
});

// DELETE /api/contact-responses/:email/:subject
router.delete("/contact-responses/:email/:subject", (req, res) => {
  const decodedEmail = decodeURIComponent(req.params.email);
  const decodedSubject = decodeURIComponent(req.params.subject);

  const data = readJSON(FILES.contactAnswered, {messages: []});
  const originalLength = data.messages.length;

  data.messages = data.messages.filter(
    (msg) => !(msg.email === decodedEmail && msg.subject === decodedSubject),
  );

  if (data.messages.length === originalLength) {
    return res.status(404).json({success: false, error: "Response not found"});
  }

  writeJSON(FILES.contactAnswered, data);
  res.json({success: true});
});

// ===========================
// GET /api/user/credits
// ===========================
router.get("/user/credits", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({success: false});
  }

  const data = readJSON(FILES.users, {users: []});
  const user = data.users.find(
    (u) =>
      String(u.id) === String(req.session.user.id) &&
      u.email === req.session.user.email &&
      u.userType === "Student",
  );

  if (!user) return res.json({success: false});

  res.json({success: true, credits: user.credits});
});

module.exports = router;
