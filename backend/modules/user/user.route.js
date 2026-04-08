const express = require("express");
const router = express.Router();
const { getProfile, updateProfile } = require("./user.controller");

// Middleware yahan import hoga jab hum use banayenge
const { protect } = require("../../middlewares/auth.middleware");

// Abhi ke liye simple routes hain, baad mein inke aage protect function lagayenge
router.get("/profile", protect, getProfile);
// router.get("/profile", getProfile);

// router.put("/profile", protect, updateProfile);
router.put("/profile", updateProfile);

module.exports = router;