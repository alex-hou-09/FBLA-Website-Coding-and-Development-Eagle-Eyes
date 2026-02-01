const express = require("express");
const router = express.Router();
const Item = require("../models/Item");

// GET /api/items — all active found items
router.get("/", async (req, res) => {
  try {
    const items = await Item.find({});
    res.json({items});
  } catch (err) {
    res.status(500).json({success: false, error: err.message});
  }
});

// DELETE /api/items/:id
router.delete("/:id", async (req, res) => {
  try {
    await Item.deleteOne({id: req.params.id});
    res.json({success: true});
  } catch (err) {
    res.status(500).json({success: false, error: err.message});
  }
});

// GET /api/items/latest — last 5 items that have images
router.get("/latest", async (req, res) => {
  try {
    const items = await Item.find({image: {$ne: ""}})
      .sort({id: -1})
      .limit(5)
      .select("image name");

    res.json({
      success: true,
      items: items.map((item) => ({image: item.image, name: item.name})),
    });
  } catch (err) {
    res.status(500).json({success: false, error: err.message});
  }
});

module.exports = router;
