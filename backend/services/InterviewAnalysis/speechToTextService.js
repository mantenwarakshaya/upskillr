const aai = require("assemblyai");

const client = new aai.AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY,
});

const transcribeAudio = async (audioPath) => {
  const transcript = await client.transcripts.transcribe({
    audio: audioPath,
  });

  return transcript.text || "";
};

module.exports = transcribeAudio;