import { useState } from "react";

const AudioRecorder = ({ onRecordingComplete }) => {
  const [mediaRecorder, setMediaRecorder] =
    useState(null);

  const [recording, setRecording] =
    useState(false);

  const startRecording = async () => {
    const stream =
      await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

    const recorder = new MediaRecorder(stream);

    let chunks = [];

    recorder.ondataavailable = e => {
      chunks.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, {
        type: "audio/webm",
      });

      onRecordingComplete(blob);
    };

    recorder.start();

    setMediaRecorder(recorder);
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorder.stop();
    setRecording(false);
  };

  return (
    <button
      onClick={
        recording
          ? stopRecording
          : startRecording
      }
      className="bg-[#0967d2] text-white px-6 py-3 rounded-lg"
    >
      {recording
        ? "Stop Recording"
        : "Start Recording"}
    </button>
  );
};

export default AudioRecorder;