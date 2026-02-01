const express = require("express");
const router = express.Router();
const {sendEmail} = require("../helpers/emailHelper");
const {getContactResponseEmail} = require("../../emailTemplates");

const ContactWaiting = require("../models/ContactWaiting");
const ContactAnswered = require("../models/ContactAnswered");

// POST /api/contact — student submits a message
router.post("/", async (req, res) => {
  try {
    const {email, studentId, subject, category, message} = req.body;
    if (!email || !studentId || !subject || !category || !message) {
      return res
        .status(400)
        .json({success: false, error: "All fields are required."});
    }

    await ContactWaiting.create({email, studentId, subject, category, message});
    res.json({success: true, message: "Your message has been submitted."});
  } catch (err) {
    res.status(500).json({success: false, error: err.message});
  }
});

// POST /api/contact/respond — admin replies to a waiting message
router.post("/respond", async (req, res) => {
  try {
    const {message, response, answeredAt} = req.body;
    if (!message || !response) return res.status(400).json({success: false});

    // Find the waiting message by its content
    const waitingDoc = await ContactWaiting.findOne({
      email: message.email,
      studentId: message.studentId,
      subject: message.subject,
      message: message.message,
    });

    if (!waitingDoc) {
      return res.status(404).json({success: false, error: "Message not found"});
    }

    // Move to answered
    await ContactAnswered.create({
      email: waitingDoc.email,
      studentId: waitingDoc.studentId,
      subject: waitingDoc.subject,
      category: waitingDoc.category,
      message: waitingDoc.message,
      response,
      answeredAt,
    });

    // Delete from waiting
    await ContactWaiting.deleteOne({_id: waitingDoc._id});

    // Email the student
    const userName = waitingDoc.email.split("@")[0];
    await sendEmail({
      to: waitingDoc.email,
      ...getContactResponseEmail(userName, waitingDoc.message, response),
    });

    res.json({success: true});
  } catch (err) {
    res.status(500).json({success: false, error: err.message});
  }
});


// GET /api/contact/waiting
router.get("/waiting", async (req, res) => {
  try {
    const messages = await ContactWaiting.find({});
    res.json({messages});
  } catch (err) {
    res.status(500).json({success: false, error: err.message});
  }
});

module.exports = router;
