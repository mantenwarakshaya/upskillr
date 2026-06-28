const express = require("express");
const multer = require("multer");
const {
  startInterview,
  submitAnswer,
  getInterviewHistory,
  getInterviewById,
  speakText,                          // ← add this
} = require("../controllers/interviewController");
const { submitVoiceAnswer } = require("../services/voiceInterviewService");
const { userAuth } = require("../middleware/auth");

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 },
});

const router = express.Router();

router.post("/start", userAuth, startInterview);
router.post("/answer", userAuth, submitAnswer);
router.post("/voice-answer", userAuth, upload.single("audio"), submitVoiceAnswer);
router.post("/tts", userAuth, speakText);                           // ← now defined
router.get("/history", userAuth, getInterviewHistory);
router.get("/:id", userAuth, getInterviewById);

module.exports = router;