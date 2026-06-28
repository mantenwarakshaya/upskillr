const { speechToText } = require("./speechToTextService");
const { textToSpeech } = require("./textToSpeechService");
const { generateNextQuestion, generateFeedback } = require("./interviewService");
const { deductCredits } = require("../utils/credits/creditManager");
const Interview = require("../models/Interview");
const User = require("../models/user");

const submitVoiceAnswer = async (req, res) => {
  try {
    const { interviewId } = req.body;
    const audioFile = req.file;

    if (!audioFile) {
      return res.status(400).json({ success: false, message: "No audio file received." });
    }

    const user = await User.findById(req.user._id);
    if (!user || (user.aiUsage?.creditsRemaining || 0) < 1) {
      return res.status(400).json({ success: false, message: "Insufficient credits." });
    }

    const interview = await Interview.findOne({ _id: interviewId, userId: req.user._id });
    if (!interview) return res.status(404).json({ success: false, message: "Interview not found." });
    if (interview.completed) return res.status(400).json({ success: false, message: "Interview already completed." });

    // 1. Transcribe audio
    const answer = await speechToText(audioFile.path);
    if (!answer?.trim()) {
      return res.status(400).json({ success: false, message: "Could not transcribe audio. Please try again." });
    }

    // Save answer
    interview.answers.push(answer);

    // Check BEFORE pushing new question — how many questions answered so far
    const answeredCount = interview.answers.length;   // e.g. 1 after first answer
    const totalQuestions = interview.questions.length; // e.g. 1 at start

    let responseText;
    let completed = false;
    let feedback = null;
    let nextQuestion = null;

    if (answeredCount >= 5) {
      // All 5 questions answered — generate feedback
      feedback = await generateFeedback(interview.role, interview.questions, interview.answers);
      interview.completed = true;
      interview.feedback = feedback;
      responseText = "That wraps up our interview! Thank you for your time. I've generated your performance report — you can view it now.";
      completed = true;
    } else {
      // Generate the next question
      nextQuestion = await generateNextQuestion(
        interview.role,
        interview.questions,
        interview.answers,
        totalQuestions + 1   // next question number
      );
      interview.questions.push(nextQuestion);
      responseText = nextQuestion;
    }

    await deductCredits(req.user._id, 1);
    await interview.save();

    // 2. Convert response text to speech
    const audioUrl = await textToSpeech(responseText);

    return res.status(200).json({
      success: true,
      completed,
      audioUrl,
      transcript: answer,
      question: nextQuestion,           // ← send the new question text to frontend
      questionNumber: answeredCount + 1, // next question number to show in progress bar
      feedback: completed ? feedback : null,
      creditsRemaining: (user.aiUsage?.creditsRemaining || 0) - 1,
    });

  } catch (error) {
    console.error("Voice Submit Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { submitVoiceAnswer };