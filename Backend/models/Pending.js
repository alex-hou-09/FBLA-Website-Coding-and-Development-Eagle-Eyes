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

    // found-report fields
    locationFound: {type: String},
    dateFound: {type: String},

    // lost-report fields
    lastSeen: {type: String},

    // item-claim fields
    itemID: {type: String},
    dateLost: {type: String},
    uniqueFeatures: {type: String},
    notes: {type: String},

    // image upload fields
    tempImagePath: {type: String},
    originalImageName: {type: String},
  },
  {_id: true},
);

module.exports = mongoose.model("Pending", pendingSchema);
