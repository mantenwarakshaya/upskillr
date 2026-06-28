const Interview = require("../models/Interview");
const User = require("../models/user");
const { textToSpeech } = require("../services/textToSpeechService");

const {
generateFirstQuestion,
generateNextQuestion,
generateFeedback,
} = require("../services/interviewService");

const {
deductCredits,
} = require("../utils/credits/creditManager");

// Start Interview
const startInterview = async (req, res) => {
try {
const { role } = req.body;

const currentMonthStart = new Date(
  new Date().getFullYear(),
  new Date().getMonth(),
  1
);

const existingInterview =
  await Interview.findOne({
    userId: req.user._id,
    createdAt: { $gte: currentMonthStart },
  });

if (existingInterview) {
  return res.status(400).json({
    success: false,
    message:
      "You have already taken your monthly mock interview.",
  });
}

if (!role?.trim()) {
  return res.status(400).json({
    success: false,
    message: "Role is required",
  });
}

const user = await User.findById(req.user._id);

if (!user) {
  return res.status(404).json({
    success: false,
    message: "User not found",
  });
}

const availableCredits =
  user.aiUsage?.creditsRemaining || 0;

if (availableCredits < 5) {
  return res.status(400).json({
    success: false,
    message:
      "You need at least 5 credits to start a mock interview.",
  });
}

const question =
  await generateFirstQuestion(role);

const interview = await Interview.create({
  userId: req.user._id,
  role,
  questions: [question],
  answers: [],
  completed: false,
});

return res.status(201).json({
  success: true,
  interviewId: interview._id,
  question,
  creditsRequired: 5,
});

} catch (error) {
console.error("Start Interview Error:", error);

return res.status(500).json({
  success: false,
  message: error.message,
});

}
};

// Submit Answer
const submitAnswer = async (req, res) => {
  try {
    const { interviewId, answer } = req.body;

    if (!answer?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Answer is required",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if ((user.aiUsage?.creditsRemaining || 0) < 1) {
      return res.status(400).json({
        success: false,
        message: "Insufficient credits.",
      });
    }

    const interview = await Interview.findOne({
      _id: interviewId,
      userId: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    if (interview.completed) {
      return res.status(400).json({
        success: false,
        message: "Interview already completed",
      });
    }

    // Save answer first
    interview.answers.push(answer);

    const currentQuestionCount = interview.questions.length;

    // Question 5 completed -> Generate final feedback
    if (currentQuestionCount >= 5) {
      const feedback = await generateFeedback(
        interview.role,
        interview.questions,
        interview.answers
      );

      // Deduct credit ONLY after AI succeeds
      await deductCredits(req.user._id, 1);

      interview.completed = true;
      interview.feedback = feedback;

      await interview.save();

      return res.status(200).json({
        success: true,
        completed: true,
        feedback,
        creditsRemaining:
          (user.aiUsage?.creditsRemaining || 0) - 1,
      });
    }

    // Generate next question
    const nextQuestion = await generateNextQuestion(
      interview.role,
      interview.questions,
      interview.answers,
      currentQuestionCount + 1
    );

    // Deduct credit ONLY after AI succeeds
    await deductCredits(req.user._id, 1);

    interview.questions.push(nextQuestion);

    await interview.save();

    return res.status(200).json({
      success: true,
      completed: false,
      question: nextQuestion,
      questionNumber: currentQuestionCount + 1,
      creditsRemaining:
        (user.aiUsage?.creditsRemaining || 0) - 1,
    });
  } catch (error) {
    console.error("Submit Answer Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Interview History
const getInterviewHistory = async (
req,
res
) => {
try {
const interviews =
await Interview.find({
userId: req.user._id,
})
.select(
"role completed feedback.score createdAt"
)
.sort({ createdAt: -1 });


return res.status(200).json({
  success: true,
  interviews,
});

} catch (error) {
console.error(
"Interview History Error:",
error
);

return res.status(500).json({
  success: false,
  message: error.message,
});

}
};

// Get Single Interview
const getInterviewById = async (
req,
res
) => {
try {
const interview =
await Interview.findOne({
_id: req.params.id,
userId: req.user._id,
});

if (!interview) {
  return res.status(404).json({
    success: false,
    message: "Interview not found",
  });
}

return res.status(200).json({
  success: true,
  interview,
});

} catch (error) {
console.error(
"Get Interview Error:",
error
);

return res.status(500).json({
  success: false,
  message: error.message,
});

}
};

const speakText = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ success: false, message: "Text required" });
    const audioUrl = await textToSpeech(text);
    return res.status(200).json({ success: true, audioUrl });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { startInterview, submitAnswer, getInterviewHistory, getInterviewById, speakText };
