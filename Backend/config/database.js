const mongoose = require("mongoose");

const MONGO_URI =
  "mongodb+srv://alexanderhou:01042009AlexH@lost-and-found.boaa8rq.mongodb.net/";

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB!");
  } catch (err) {
    console.error("DB connection error:", err);
    process.exit(1); // Crash fast if the DB is unreachable
  }
}

module.exports = {connectDB};
