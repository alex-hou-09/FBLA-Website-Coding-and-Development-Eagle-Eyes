const mongoose = require("mongoose");

const pendingSchema = new mongoose.Schema(
  {
    typeOfSubmission: {
      type: String,
      enum: ["found-report", "lost-report", "item-claim"],
      required: true,
    },
    studentEmail: {type: String, required: true},
    studentID: {type: String, required: true},
    itemName: {type: String},
    category: {type: String},
    color: {type: String},
    description: {type: String},

    locationFound: {type: String},
    dateFound: {type: String},

    lastSeen: {type: String},

    itemID: {type: String},
    dateLost: {type: String},
    uniqueFeatures: {type: String},
    notes: {type: String},

    tempImagePath: {type: String},
    originalImageName: {type: String},
  },
  {_id: true},
);

module.exports = mongoose.model("Pending", pendingSchema);
