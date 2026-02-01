const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    id: {type: Number, required: true},
    userType: {type: String, enum: ["Student", "Admin"], required: true},
    credits: {type: Number, default: 0},
  },
  {_id: true}, // let Mongo generate _id, we keep "id" as a separate field
);

module.exports = mongoose.model("User", userSchema);
