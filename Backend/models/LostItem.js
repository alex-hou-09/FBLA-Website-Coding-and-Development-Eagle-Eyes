const mongoose = require("mongoose");

const lostItemSchema = new mongoose.Schema(
  {
    typeOfSubmission: {type: String, default: "lost-report"},
    studentEmail: {type: String, required: true},
    studentID: {type: String, required: true},
    itemName: {type: String, required: true},
    category: {type: String},
    color: {type: String},
    description: {type: String},
    lastSeen: {type: String},
    tempImagePath: {type: String},
    originalImageName: {type: String},
    image: {type: String, default: ""},
  },
  {_id: true},
);

module.exports = mongoose.model("LostItem", lostItemSchema);
