const mongoose = require("mongoose");

const itemClaimSchema = new mongoose.Schema(
  {
    typeOfSubmission: {type: String, default: "item-claim"},
    studentEmail: {type: String, required: true},
    studentID: {type: String, required: true},
    itemName: {type: String},
    itemID: {type: String, required: true},
    dateLost: {type: String},
    uniqueFeatures: {type: String},
    notes: {type: String},
    status: {type: String, default: "Approved"},
  },
  {_id: true},
);

module.exports = mongoose.model("ItemClaim", itemClaimSchema);
