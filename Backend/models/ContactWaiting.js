const mongoose = require("mongoose");

const contactWaitingSchema = new mongoose.Schema(
  {
    email: {type: String, required: true},
    studentId: {type: String, required: true},
    subject: {type: String, required: true},
    category: {type: String, required: true},
    message: {type: String, required: true},
  },
  {_id: true},
);

module.exports = mongoose.model("ContactWaiting", contactWaitingSchema);
