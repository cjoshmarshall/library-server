const express = require("express");
const router = express.Router();
const User = require("../model/user");
const { verifyTokenAndAdmin } = require("../middleware/token");

router.get("/", verifyTokenAndAdmin, async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (err) {
    res.status(500).send("Something Went Wrong");
  }
});

router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send("User Not Found");

    const { password, ...rest } = user._doc;
    res.status(200).json(rest);
  } catch (err) {
    res.status(500).send("Something Went Wrong");
  }
});

router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, {
      $set: req.body,
    });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).send("Something Went Wrong");
  }
});

router.delete("/", verifyTokenAndAdmin, async (req, res) => {
  try {
    const user = await User.deleteOne(req.body._id);
    res.status(200).send("User Deleted");
  } catch (err) {
    res.status(500).send("Something Went Wrong");
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    res.status(200).send("User Deleted");
  } catch (err) {
    res.status(500).send("Something Went Wrong");
  }
});

module.exports = router;
