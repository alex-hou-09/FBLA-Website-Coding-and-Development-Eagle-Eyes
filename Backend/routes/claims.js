const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const {upload} = require("../config/multer");
const {
  FILES,
  IMAGES_DIR,
  readJSON,
  writeJSON,
  ensureFile,
  awardCredits,
} = require("../helpers/fileHelpers");
const {sendEmail} = require("../helpers/emailHelper");
const {
  getClaimApprovedEmail,
  getClaimDeniedEmail,
  getItemClaimedEmail,
} = require("../../emailTemplates"); // adjust path if emailTemplates moves

// ===========================
// POST /api/claims
// Submit a found-report or lost-report (with optional image upload)
// ===========================
router.post("/", upload.single("image"), (req, res) => {
  const newClaim = {
    typeOfSubmission: req.body.typeOfSubmission,
    studentEmail: req.body.studentEmail,
    studentID: req.body.studentID,
    itemName: req.body.itemName,
    category: req.body.category,
    color: req.body.color,
    description: req.body.description,
  };

  if (req.body.typeOfSubmission === "found-report") {
    newClaim.locationFound = req.body.locationFound;
    newClaim.dateFound = req.body.dateFound;
  } else if (req.body.typeOfSubmission === "lost-report") {
    newClaim.lastSeen = req.body.lastSeen;
  }

  if (req.file) {
    newClaim.tempImagePath = req.file.path;
    newClaim.originalImageName = req.file.filename;
  }

  const data = readJSON(FILES.pending, {pending: []});
  data.pending.push(newClaim);
  writeJSON(FILES.pending, data);
  res.json({success: true});
});

// ===========================
// POST /api/claims/item-claims  (mounted at /api/claims, so path is /item-claims)
// Actually this was originally /api/item-claims — keep it mounted on the main
// router in server.js as: app.use("/api/item-claims", ...) OR just define it here
// and mount claims at /api. See note in server.js.
// For a clean split we keep the original URL contract by mounting in server.js as:
//   app.use("/api/item-claims", claimRoutes.itemClaims)
// But simpler: just define the full sub-path here.
// ===========================

// POST /api/item-claims  — we'll mount this router at /api in server.js
// and use the path /item-claims below.
router.post("/item-claims", (req, res) => {
  const {
    studentEmail,
    studentID,
    itemName,
    itemID,
    dateLost,
    uniqueFeatures,
    notes,
  } = req.body;

  if (!studentEmail || !studentID || !itemID || !dateLost) {
    return res
      .status(400)
      .json({success: false, error: "Required fields are missing."});
  }

  const data = readJSON(FILES.pending, {pending: []});
  data.pending.push({
    typeOfSubmission: "item-claim",
    studentEmail,
    studentID,
    itemName,
    itemID,
    dateLost,
    uniqueFeatures,
    notes,
  });

  writeJSON(FILES.pending, data);
  res.json({success: true, message: "Claim submitted and pending approval."});
});

// ===========================
// POST /api/claims/decision
// Admin approves or denies a pending submission
// ===========================
router.post("/decision", async (req, res) => {
  try {
    const {submission, decision} = req.body;

    ensureFile(FILES.pending, "pending");
    ensureFile(FILES.itemClaims, "claims");
    ensureFile(FILES.lostItems, "lost");
    ensureFile(FILES.items, "items");
    ensureFile(FILES.claimedItems, "claimedItems");

    const pendingData = readJSON(FILES.pending, {pending: []});

    const submissionIndex = pendingData.pending.findIndex(
      (p) =>
        p.typeOfSubmission === submission.typeOfSubmission &&
        p.studentEmail === submission.studentEmail &&
        (p.itemID === submission.itemID || p.itemName === submission.itemName),
    );

    let imagePath = "";

    // --- Image handling (move to Images/ on approve, delete on deny) ---
    if (submissionIndex !== -1) {
      const found = pendingData.pending[submissionIndex];

      if (decision === "approve" && found.tempImagePath) {
        const finalImageName = found.originalImageName;
        const finalImagePath = path.join(IMAGES_DIR, finalImageName);
        try {
          fs.copyFileSync(found.tempImagePath, finalImagePath);
          imagePath = `../Images/${finalImageName}`;
          fs.unlinkSync(found.tempImagePath);
          console.log(`✓ Image moved successfully: ${finalImageName}`);
        } catch (err) {
          console.error("Error moving image:", err);
        }
      } else if (found.tempImagePath) {
        try {
          fs.unlinkSync(found.tempImagePath);
          console.log(`✓ Temp image deleted (report was denied)`);
        } catch (err) {
          console.error("Error deleting temp image:", err);
        }
      }
    }

    // Remove from pending regardless of decision
    pendingData.pending = pendingData.pending.filter(
      (p) =>
        !(
          p.typeOfSubmission === submission.typeOfSubmission &&
          p.studentEmail === submission.studentEmail &&
          (p.itemID === submission.itemID || p.itemName === submission.itemName)
        ),
    );

    // --- APPROVE logic ---
    if (decision === "approve") {
      // 1. Item-Claim: move item from active → claimed, award credits to submitter
      if (submission.typeOfSubmission === "item-claim") {
        const claims = readJSON(FILES.itemClaims, {claims: []});
        claims.claims.push({...submission, status: "Approved"});
        writeJSON(FILES.itemClaims, claims);

        const itemsData = readJSON(FILES.items, {items: []});
        const claimedData = readJSON(FILES.claimedItems, {claimedItems: []});

        const claimedItem = itemsData.items.find(
          (item) => String(item.id) === String(submission.itemID),
        );
        if (!claimedItem) {
          throw new Error("Item not found in _item-information.json");
        }

        claimedData.claimedItems.push({
          ...claimedItem,
          claimedByEmail: submission.studentEmail,
          claimedByID: submission.studentID,
          claimedAt: new Date().toISOString(),
        });
        writeJSON(FILES.claimedItems, claimedData);

        awardCredits(claimedItem.submitterID, 10);

        itemsData.items = itemsData.items.filter(
          (item) => String(item.id) !== String(submission.itemID),
        );
        writeJSON(FILES.items, itemsData);

        // Email the claimer
        const userName = submission.studentEmail.split("@")[0];
        await sendEmail({
          to: submission.studentEmail,
          ...getClaimApprovedEmail(
            userName,
            submission.itemName || `Item ID: ${submission.itemID}`,
            submission.typeOfSubmission,
          ),
        });

        // Email the original submitter
        if (claimedItem.submitterEmail) {
          const submitterName = claimedItem.submitterEmail.split("@")[0];
          await sendEmail({
            to: claimedItem.submitterEmail,
            ...getItemClaimedEmail(
              submitterName,
              claimedItem.name,
              submission.studentEmail,
            ),
          });
        }
      }

      // 2. Lost-Report: add to lost-items list
      if (submission.typeOfSubmission === "lost-report") {
        const lost = readJSON(FILES.lostItems, {lost: []});
        lost.lost.push({...submission, image: imagePath});
        writeJSON(FILES.lostItems, lost);

        const userName = submission.studentEmail.split("@")[0];
        await sendEmail({
          to: submission.studentEmail,
          ...getClaimApprovedEmail(
            userName,
            submission.itemName,
            submission.typeOfSubmission,
          ),
        });
      }

      // 3. Found-Report: add to active items
      if (submission.typeOfSubmission === "found-report") {
        const items = readJSON(FILES.items, {items: []});
        items.items.push({
          id: Date.now().toString(),
          name: submission.itemName,
          category: submission.category,
          color: submission.color,
          description: submission.description,
          locationFound: submission.locationFound,
          dateFound: submission.dateFound,
          image: imagePath,
          status: "Pending",
          submitterEmail: submission.studentEmail,
          submitterID: submission.studentID,
        });
        writeJSON(FILES.items, items);

        const userName = submission.studentEmail.split("@")[0];
        await sendEmail({
          to: submission.studentEmail,
          ...getClaimApprovedEmail(
            userName,
            submission.itemName,
            submission.typeOfSubmission,
          ),
        });
      }
    }

    // --- DENY logic ---
    if (decision === "deny") {
      const userName = submission.studentEmail.split("@")[0];
      const itemName = submission.itemName || `Item ID: ${submission.itemID}`;
      await sendEmail({
        to: submission.studentEmail,
        ...getClaimDeniedEmail(
          userName,
          itemName,
          "Your submission did not meet our verification requirements.",
        ),
      });
    }

    writeJSON(FILES.pending, pendingData);
    res.json({
      success: true,
      message: `${decision === "approve" ? "Approved" : "Denied"} and email sent`,
    });
  } catch (err) {
    console.error("CLAIM DECISION ERROR:", err);
    res.status(500).json({success: false});
  }
});

module.exports = router;
