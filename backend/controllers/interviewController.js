const Interview = require("../models/Interview");

const {
  generateFirstQuestion,
  generateNextQuestion,
  generateFeedback,
} = require("../services/interviewService");


 const startInterview = async (req, res) => {
  try {
    const { role } = req.body;
    const question = await generateFirstQuestion(role);

    if (!role?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Role is required",
      });
    }

    const interview = await Interview.create({
      userId: req.user.id,
      role,
      questions: [question],
      answers: [],
      completed: false,
    });

    res.status(201).json({
      success: true,
      interviewId: interview._id,
      question,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

 const submitAnswer = async (req, res) => {
  try {
    const { interviewId, answer } = req.body;
    const interview = await Interview.findOne({
      _id: interviewId,
      userId: req.user.id,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    if (!answer?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Answer is required",
      });
    }

    interview.answers.push(answer);

    const currentQuestionCount =
      interview.questions.length;

    if (currentQuestionCount >= 5) {
      const feedback = await generateFeedback(
        interview.role,
        interview.questions,
        interview.answers
      );

      interview.completed = true;
      interview.feedback = feedback;

      await interview.save();

      return res.json({
        success: true,
        completed: true,
        feedback,
      });
    }

    if (interview.completed) {
      return res.status(400).json({
        success: false,
        message: "Interview already completed",
      });
    }

    const nextQuestion = await generateNextQuestion(
      interview.role,
      interview.questions,
      interview.answers,
      currentQuestionCount + 1
    );

    interview.questions.push(nextQuestion);
    await interview.save();

    res.json({
      success: true,
      completed: false,
      question: nextQuestion,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

 const getInterviewHistory = async (
  req,
  res
) => {
  try {
    const interviews = await Interview.find({
      userId: req.user.id,
    })
    .select("role completed feedback.score createdAt")
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      interviews,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const getInterviewById = async (req, res) => {
  try {
    const interview = await Interview.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    res.json({
      success: true,
      interview,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  startInterview,
  submitAnswer,
  getInterviewHistory,
  getInterviewById,
};