const express = require("express");
const router = express.Router();
const {FILES, readJSON, writeJSON} = require("../helpers/fileHelpers");

// GET all items
router.get("/", (req, res) => {
  const data = readJSON(FILES.items, {items: []});
  res.json(data);
});

// DELETE an item by id
router.delete("/:id", (req, res) => {
  const id = String(req.params.id);
  const data = readJSON(FILES.items, {items: []});
  const filtered = data.items.filter((item) => String(item.id) !== id);
  writeJSON(FILES.items, {items: filtered});
  res.json({success: true});
});

// GET latest 5 items that have images (used for homepage carousel, etc.)
router.get("/latest", (req, res) => {
  const data = readJSON(FILES.items, {items: []});

  const latestItems = data.items
    .filter((item) => item.image && item.image !== "")
    .sort((a, b) => Number(b.id) - Number(a.id))
    .slice(0, 5)
    .map((item) => ({
      image: item.image,
      name: item.name,
    }));

  res.json({success: true, items: latestItems});
});

module.exports = router;
