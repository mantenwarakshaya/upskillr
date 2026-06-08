const express = require("express");
const router = express.Router();

const {
  startInterview,
  submitAnswer, // 1. Import your submitAnswer function here
} = require("../controllers/interviewController");

const { userAuth } = require("../middleware/auth");

// Start interview route
router.post(
  "/start",
  userAuth,
  startInterview
);

// 2. Add the answer route here to fix the 404
router.post(
  "/answer",
  userAuth,
  submitAnswer
);

module.exports = router;