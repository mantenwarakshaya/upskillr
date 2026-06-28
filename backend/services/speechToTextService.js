const assemblyai = require("assemblyai");
const fs = require("fs");
const dotenv = require("dotenv");
dotenv.config();

const client = new assemblyai.AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY });

const speechToText = async (audioFilePath) => {
  try {
    const transcript = await client.transcripts.transcribe({ audio: audioFilePath });
    return transcript.text;
  } catch (error) {
    console.error("Speech To Text Error:", error);
    throw new Error("Failed to transcribe audio");
  } finally {
    // Delete temp file after transcription
    fs.unlink(audioFilePath, () => {});
  }
};

module.exports = { speechToText };