const Interview = require("../models/Interview");
const transcribeAudio = require("../services/InterviewAnalysis/speechToTextService");
const generateSpeech = require("../services/InterviewAnalysis/textToSpeechService");
const {
  generateQuestion,
} = require("../services/InterviewAnalysis/interviewService");

exports.startInterview = async (req, res) => {
  try {
    const { targetRole } = req.body;

    const question =
      await generateQuestion(targetRole, []);

    const audioUrl =
      await generateSpeech(question);

    res.json({
      success: true,
      question,
      audioUrl,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ... keep your existing imports and startInterview at the top ...

exports.submitAnswer = async (req, res) => {
  try {
    // 1. Ensure a file was actually uploaded (Requires multer middleware on the route)
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No audio file received" });
    }

    // 2. Transcribe the audio file using your AssemblyAI service
    // (Depending on how your service is written, pass the file path or buffer)
    const transcribedText = await transcribeAudio(req.file.path); 
    console.log("Transcribed Answer:", transcribedText);

    // 3. For now, let's mock the flow so your frontend doesn't break.
    // In production, you would fetch the Interview from DB, check question count, etc.
    const isInterviewComplete = false; // Toggle to true when you want to test feedback

    if (isInterviewComplete) {
      // Return final feedback matching what your frontend FeedbackSection expects
      return res.json({
        success: true,
        interviewCompleted: true,
        feedback: {
          score: 85,
          strengths: ["Good communication", "Understands MERN stack basics"],
          weaknesses: ["Could explain database indexing deeper"]
        }
      });
    } else {
      // Generate the next question and its audio audioUrl
      const nextQuestion = await generateQuestion("MERN Developer", [transcribedText]);
      const audioUrl = await generateSpeech(nextQuestion);

      return res.json({
        success: true,
        interviewCompleted: false,
        question: nextQuestion,
        audioUrl: audioUrl
      });
    }

  } catch (err) {
    console.error("Submit Answer Error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};