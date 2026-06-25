const express = require("express");

const {
  startInterview,
  submitAnswer,
  getInterviewHistory,
  getInterviewById,
} = require("../controllers/interviewController");

const { userAuth } = require("../middleware/auth");

console.log("auth:", typeof userAuth);
console.log("startInterview:", typeof startInterview);
console.log("submitAnswer:", typeof submitAnswer);

const router = express.Router();

router.post("/start", userAuth, startInterview);

router.post("/answer", userAuth, submitAnswer);

router.get("/history", userAuth, getInterviewHistory);

router.get("/:id", userAuth, getInterviewById);

module.exports = router;