const express = require("express");
const router = express.Router();
const {FILES, readJSON, writeJSON} = require("../helpers/fileHelpers");
const {sendEmail} = require("../helpers/emailHelper");
const {getContactResponseEmail} = require("../../emailTemplates");

// POST /api/contact — student submits a contact message
router.post("/", (req, res) => {
  const {email, studentId, subject, category, message} = req.body;
  if (!email || !studentId || !subject || !category || !message) {
    return res
      .status(400)
      .json({success: false, error: "All fields are required."});
  }

  const data = readJSON(FILES.contactWaiting, {messages: []});
  data.messages.push({email, studentId, subject, category, message});
  writeJSON(FILES.contactWaiting, data);

  res.json({success: true, message: "Your message has been submitted."});
});

// POST /api/contact/respond — admin replies to a waiting message
router.post("/respond", async (req, res) => {
  const {message, response, answeredAt} = req.body;
  if (!message || !response) return res.status(400).json({success: false});

  const waitingData = readJSON(FILES.contactWaiting, {messages: []});
  const answeredData = readJSON(FILES.contactAnswered, {messages: []});

  const index = waitingData.messages.findIndex(
    (m) =>
      m.email === message.email &&
      m.studentId === message.studentId &&
      m.subject === message.subject &&
      m.message === message.message,
  );

  if (index === -1) {
    return res.status(404).json({success: false, error: "Message not found"});
  }

  const [removedMessage] = waitingData.messages.splice(index, 1);
  answeredData.messages.push({...removedMessage, response, answeredAt});

  writeJSON(FILES.contactWaiting, waitingData);
  writeJSON(FILES.contactAnswered, answeredData);

  // Notify the student
  const userName = removedMessage.email.split("@")[0];
  await sendEmail({
    to: removedMessage.email,
    ...getContactResponseEmail(userName, removedMessage.message, response),
  });

  res.json({success: true});
});

module.exports = router;
