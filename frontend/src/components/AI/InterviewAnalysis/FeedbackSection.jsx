const FeedbackSection = ({ feedback }) => {
  if (!feedback) return null;

  return (
    <div className="bg-white rounded-lg p-6 mt-6">
      <h2 className="text-2xl font-bold mb-4">
        Interview Feedback
      </h2>

      <p>
        <strong>Score:</strong>
        {feedback.score}%
      </p>

      <div className="mt-4">
        <h3 className="font-bold">
          Strengths
        </h3>

        <ul>
          {feedback.strengths.map(item => (
            <li key={item}>
              • {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4">
        <h3 className="font-bold">
          Weaknesses
        </h3>

        <ul>
          {feedback.weaknesses.map(item => (
            <li key={item}>
              • {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FeedbackSection;