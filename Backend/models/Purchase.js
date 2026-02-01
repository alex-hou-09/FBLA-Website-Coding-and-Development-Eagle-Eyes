const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema(
  {
    itemKey: {
      type: String,
      enum: ["candy", "tickets", "cards"],
      required: true,
    },
    email: {type: String, required: true},
    ID: {type: Number, required: true},
    purchasedAt: {type: String, required: true},
  },
  {_id: true},
);

module.exports = mongoose.model("Purchase", purchaseSchema);
