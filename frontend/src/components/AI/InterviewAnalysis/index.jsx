import { useState } from "react";

import InterviewScreen from "./InterviewScreen";
import FeedbackSection from "./FeedbackSection";

import {
  startInterview,
  submitAnswer,
} from "../../../utils/interviewApi";

const AIInterview = () => {
  const [question, setQuestion] =
    useState("");

  const [feedback, setFeedback] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [interviewStarted,
    setInterviewStarted] =
    useState(false);

  const beginInterview = async () => {
    try {
      const response =
        await startInterview({
          targetRole: "MERN Developer",
        });

      setQuestion(
        response.data.question
      );

      const audio =
        new Audio(
          response.data.audioUrl
        );

      audio.play();

      setInterviewStarted(true);
    } catch (error) {
      console.log(error);
    }
  };

  const handleAnswerSubmit =
    async formData => {
      try {
        setLoading(true);

        const response =
          await submitAnswer(formData);

        if (
          response.data.interviewCompleted
        ) {
          setFeedback(
            response.data.feedback
          );
        } else {
          setQuestion(
            response.data.question
          );

          const audio =
            new Audio(
              response.data.audioUrl
            );

          audio.play();
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="min-h-screen bg-[#f3f3f3] p-8">
      {!interviewStarted ? (
        <button
          onClick={beginInterview}
          className="bg-[#0967d2] text-white px-8 py-4 rounded-lg"
        >
          Start Interview
        </button>
      ) : (
        <InterviewScreen
          question={question}
          loading={loading}
          onAnswerSubmit={
            handleAnswerSubmit
          }
        />
      )}

      <FeedbackSection
        feedback={feedback}
      />
    </div>
  );
};

export default AIInterview;