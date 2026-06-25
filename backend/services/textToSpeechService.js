const axios = require("axios");

 const textToSpeech = async (text) => {
  try {
    const response = await axios.post(
      "https://api.murf.ai/v1/speech/generate",
      {
        text,
        voiceId: "en-US-natalie",
      },
      {
        headers: {
          "api-key": process.env.MURF_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.audioFile;
  } catch (error) {
    console.error("Text To Speech Error:", error);
    throw new Error("Failed to generate speech");
  }
};

module.exports = {
  textToSpeech,
};