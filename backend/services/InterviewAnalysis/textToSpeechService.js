const axios = require("axios");

const generateSpeech = async (text) => {
  const response = await axios.post(
    "https://api.murf.ai/v1/speech/generate",
    {
      text,
      voiceId: "en-US-natalie",
    },
    {
      headers: {
        "api-key": process.env.MURF_API_KEY,
      },
    }
  );

  return response.data.audioFile;
};

module.exports = generateSpeech;