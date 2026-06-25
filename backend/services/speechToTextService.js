const assemblyai = require("assemblyai");
const dotenv = require("dotenv");

dotenv.config();

const client = new assemblyai.AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY,
});

 const speechToText = async (audioFileUrl) => {
  try {
    const transcript = await client.transcripts.transcribe({
      audio: audioFileUrl,
    });

    return transcript.text;
  } catch (error) {
    console.error("Speech To Text Error:", error);
    throw new Error("Failed to transcribe audio");
  }
};

module.exports = {
  speechToText,
};