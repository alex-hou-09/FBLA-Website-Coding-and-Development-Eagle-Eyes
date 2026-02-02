const mongoose = require("mongoose");

const claimedItemSchema = new mongoose.Schema(
  {
    id: {type: String, required: true},
    name: {type: String},
    category: {type: String},
    color: {type: String},
    description: {type: String},
    locationFound: {type: String},
    dateFound: {type: String},
    image: {type: String, default: ""},
    submitterEmail: {type: String},
    submitterID: {type: String},
    claimedByEmail: {type: String, required: true},
    claimedByID: {type: String, required: true},
    claimedAt: {type: String},
  },
  {_id: true},
);

module.exports = mongoose.model("ClaimedItem", claimedItemSchema);
