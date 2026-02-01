const mongoose = require("mongoose");

const contactAnsweredSchema = new mongoose.Schema(
  {
    email: {type: String, required: true},
    studentId: {type: String, required: true},
    subject: {type: String, required: true},
    category: {type: String},
    message: {type: String, required: true},
    response: {type: String, required: true},
    answeredAt: {type: String},
  },
  {_id: true},
);

module.exports = mongoose.model("ContactAnswered", contactAnsweredSchema);
