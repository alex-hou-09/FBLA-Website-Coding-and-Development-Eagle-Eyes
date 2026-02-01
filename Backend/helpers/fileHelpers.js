const fs = require("fs");
const path = require("path");

// ===========================
// File Paths
// ===========================
// Adjust these relative paths based on where your Data / Frontend folders
// live relative to this file (currently assumes Backend/ is a sibling of both).
const DATA_DIR = path.join(__dirname, "..", "..", "Data");
const IMAGES_DIR = path.join(__dirname, "..", "..", "Frontend", "Images");

const FILES = {
  items: path.join(DATA_DIR, "_item-information.json"),
  users: path.join(DATA_DIR, "user-information.json"),
  pending: path.join(DATA_DIR, "pending-base.json"),
  contactWaiting: path.join(DATA_DIR, "waiting-contact.json"),
  contactAnswered: path.join(DATA_DIR, "answered-contact.json"),
  itemClaims: path.join(DATA_DIR, "item-claims.json"),
  lostItems: path.join(DATA_DIR, "lost-items.json"),
  claimedItems: path.join(DATA_DIR, "claimed-items.json"),
  purchased: path.join(DATA_DIR, "purchased.json"),
};

// ===========================
// Helper Functions
// ===========================
function readJSON(filePath, defaultValue = {}) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2));
    return defaultValue;
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return defaultValue;
  }
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function ensureFile(filePath, key) {
  if (!fs.existsSync(filePath)) {
    writeJSON(filePath, {[key]: []});
  }
}

function awardCredits(userID, amount) {
  const usersData = readJSON(FILES.users, {users: []});

  const user = usersData.users.find(
    (u) => String(u.id) === String(userID) && u.userType === "Student",
  );

  if (!user) return;

  user.credits = (user.credits || 0) + amount;
  writeJSON(FILES.users, usersData);
}

module.exports = {
  FILES,
  IMAGES_DIR,
  readJSON,
  writeJSON,
  ensureFile,
  awardCredits,
};
