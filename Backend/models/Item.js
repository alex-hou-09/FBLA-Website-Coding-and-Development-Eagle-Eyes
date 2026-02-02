const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    id: {type: String, required: true, unique: true},
    name: {type: String, required: true},
    category: {type: String},
    color: {type: String},
    description: {type: String},
    locationFound: {type: String},
    dateFound: {type: String},
    image: {type: String, default: ""},
    status: {type: String, default: "Pending"},
    submitterEmail: {type: String},
    submitterID: {type: String},
  },
  {_id: true},
);

module.exports = mongoose.model("Item", itemSchema);
