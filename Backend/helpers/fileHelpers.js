const path = require("path");

// The only file-system path still needed: where approved images get moved to.
// All data reads/writes now go through Mongoose — see models/.
const IMAGES_DIR = path.join(__dirname, "..", "..", "Frontend", "Images");

module.exports = {IMAGES_DIR};
