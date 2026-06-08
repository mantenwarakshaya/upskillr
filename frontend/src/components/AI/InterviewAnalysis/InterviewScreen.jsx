import AudioRecorder from "./AudioRecorder";

const InterviewScreen = ({
  question,
  onAnswerSubmit,
  loading,
}) => {
  const handleRecording = blob => {
    const formData = new FormData();

    formData.append(
      "audio",
      blob,
      "answer.webm"
    );

    onAnswerSubmit(formData);
  };

  return (
    <div className="bg-white rounded-xl p-8">
      <h2 className="text-xl font-bold mb-4">
        AI Interviewer
      </h2>

      <div className="bg-[#e6f6ff] p-4 rounded-lg mb-6">
        {question}
      </div>

      <AudioRecorder
        onRecordingComplete={
          handleRecording
        }
      />

      {loading && (
        <p className="mt-4">
          Processing answer...
        </p>
      )}
    </div>
  );
};

export default InterviewScreen;