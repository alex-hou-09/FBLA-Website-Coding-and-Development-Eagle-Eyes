const express = require("express");
const fs = require("fs");
const sharp = require("sharp");
const path = require("path");
const router = express.Router();

const {upload} = require("../config/multer");
const {IMAGES_DIR} = require("../helpers/fileHelpers");
const {sendEmail} = require("../helpers/emailHelper");
const {
  getClaimApprovedEmail,
  getClaimDeniedEmail,
  getItemClaimedEmail,
} = require("../../emailTemplates");

const Pending = require("../models/Pending");
const Item = require("../models/Item");
const ItemClaim = require("../models/ItemClaim");
const LostItem = require("../models/LostItem");
const ClaimedItem = require("../models/ClaimedItem");
const User = require("../models/User");

// ===========================
// POST /api/claims
// Submit a found-report or lost-report (with optional image)
// ===========================
router.post("/", upload.single("image"), async (req, res) => {
  try {
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

    await Pending.create(newClaim);
    res.json({success: true});
  } catch (err) {
    res.status(500).json({success: false, error: err.message});
  }
});

// ===========================
// POST /api/item-claims
// Submit an item claim (no image)
// ===========================
router.post("/item-claims", async (req, res) => {
  try {
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

    await Pending.create({
      typeOfSubmission: "item-claim",
      studentEmail,
      studentID,
      itemName,
      itemID,
      dateLost,
      uniqueFeatures,
      notes,
    });

    res.json({success: true, message: "Claim submitted and pending approval."});
  } catch (err) {
    res.status(500).json({success: false, error: err.message});
  }
});

// ===========================
// POST /api/claims/decision
// Admin approves or denies a pending submission
// ===========================
router.post("/decision", async (req, res) => {
  try {
    const {submission, decision} = req.body;

    // Build a more specific query to find the EXACT pending document
    const query = {
      typeOfSubmission: submission.typeOfSubmission,
      studentEmail: submission.studentEmail,
      studentID: submission.studentID,
    };

    // Add type-specific fields for better matching
    if (submission.typeOfSubmission === "item-claim") {
      query.itemID = submission.itemID;
      query.dateLost = submission.dateLost;
    } else if (submission.typeOfSubmission === "found-report") {
      query.itemName = submission.itemName;
      query.category = submission.category;
      query.dateFound = submission.dateFound;
      query.locationFound = submission.locationFound;
    } else if (submission.typeOfSubmission === "lost-report") {
      query.itemName = submission.itemName;
      query.category = submission.category;
      query.lastSeen = submission.lastSeen;
    }

    // Find the matching pending doc
    const pendingDoc = await Pending.findOne(query);

    if (!pendingDoc) {
      return res.status(404).json({
        success: false,
        error: "Pending submission not found or already processed",
      });
    }

    let imagePath = "";

    // --- Image handling ---
    if (decision === "approve" && pendingDoc.tempImagePath) {
      const finalImageName = pendingDoc.originalImageName;
      const finalImagePath = path.join(IMAGES_DIR, finalImageName);
      try {
        await sharp(pendingDoc.tempImagePath)
          .autoOrient()
          .resize({width: 600})
          .jpeg({quality: 75})
          .toFile(finalImagePath);
        imagePath = `../Images/${finalImageName}`;
        fs.unlinkSync(pendingDoc.tempImagePath);
        console.log(`✓ Image moved successfully: ${finalImageName}`);
      } catch (err) {
        console.error("Error moving image:", err);
      }
    } else if (pendingDoc.tempImagePath) {
      try {
        fs.unlinkSync(pendingDoc.tempImagePath);
        console.log(`✓ Temp image deleted (report was denied)`);
      } catch (err) {
        console.error("Error deleting temp image:", err);
      }
    }

    // Remove from pending using the specific _id
    await Pending.deleteOne({_id: pendingDoc._id});

    // --- APPROVE ---
    if (decision === "approve") {
      // 1. Item-Claim
      if (submission.typeOfSubmission === "item-claim") {
        // Record the approved claim
        await ItemClaim.create({...submission, status: "Approved"});

        // Find the active item being claimed
        const claimedItem = await Item.findOne({id: String(submission.itemID)});
        if (!claimedItem) {
          throw new Error("Item not found in Items collection");
        }

        // Move it to ClaimedItems
        await ClaimedItem.create({
          id: claimedItem.id,
          name: claimedItem.name,
          category: claimedItem.category,
          color: claimedItem.color,
          description: claimedItem.description,
          locationFound: claimedItem.locationFound,
          dateFound: claimedItem.dateFound,
          image: claimedItem.image,
          submitterEmail: claimedItem.submitterEmail,
          submitterID: claimedItem.submitterID,
          claimedByEmail: submission.studentEmail,
          claimedByID: submission.studentID,
          claimedAt: new Date().toISOString(),
        });

        // Award 10 credits to the person who turned it in
        console.log(
          `Attempting to award credits to submitterID: ${claimedItem.submitterID}`,
        );
        const creditUpdate = await User.updateOne(
          {
            $or: [
              {id: Number(claimedItem.submitterID)},
              {id: String(claimedItem.submitterID)},
            ],
            userType: "Student",
          },
          {$inc: {credits: 10}},
        );
        console.log(`Credit update result:`, creditUpdate);

        // Remove from active items
        await Item.deleteOne({id: String(submission.itemID)});

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

      // 2. Lost-Report
      if (submission.typeOfSubmission === "lost-report") {
        await LostItem.create({...submission, image: imagePath});

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

      // 3. Found-Report
      if (submission.typeOfSubmission === "found-report") {
        await Item.create({
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

    // --- DENY ---
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

    res.json({
      success: true,
      message: `${decision === "approve" ? "Approved" : "Denied"} and email sent`,
    });
  } catch (err) {
    console.error("CLAIM DECISION ERROR:", err);
    res.status(500).json({success: false});
  }
});

// GET /api/lost-items
router.get("/lost-items", async (req, res) => {
  try {
    const items = await LostItem.find({});
    res.json({lost: items});
  } catch (err) {
    res.status(500).json({success: false, error: err.message});
  }
});

// GET /api/pending
router.get("/pending", async (req, res) => {
  try {
    const pending = await Pending.find({});
    res.json({pending});
  } catch (err) {
    res.status(500).json({success: false, error: err.message});
  }
});

module.exports = router;
