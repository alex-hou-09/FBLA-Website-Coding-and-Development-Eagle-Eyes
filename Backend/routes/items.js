const express = require("express");
const router = express.Router();
const Item = require("../models/Item");

// last 5 items that have images
router.get("/latest", async (req, res) => {
  try {
    const items = await Item.find({image: {$ne: ""}})
      .limit(5)
      .select("image name id");

    // Sort by id in JavaScript since id is a string
    const sortedItems = items.sort((a, b) => {
      const idA = parseInt(a.id) || 0;
      const idB = parseInt(b.id) || 0;
      return idB - idA;
    });

    console.log(
      "Latest items being sent:",
      sortedItems.map((i) => ({id: i.id, name: i.name})),
    );

    res.json({
      success: true,
      items: sortedItems.map((item) => ({
        image: item.image,
        name: item.name,
        id: item.id,
      })),
    });
  } catch (err) {
    console.error("Error in /latest:", err);
    res.status(500).json({success: false, error: err.message});
  }
});

router.get("/", async (req, res) => {
  try {
    const items = await Item.find({});
    res.json({items});
  } catch (err) {
    res.status(500).json({success: false, error: err.message});
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Item.deleteOne({id: req.params.id});
    res.json({success: true});
  } catch (err) {
    res.status(500).json({success: false, error: err.message});
  }
});

module.exports = router;
