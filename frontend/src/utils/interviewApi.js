import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:7777/api/interview",
  withCredentials: true, // 👈 CRITICAL: This tells the browser to send the login cookie!
});

export const startInterview = data =>
  API.post("/start", data);

export const submitAnswer = data =>
  API.post("/answer", data);

export const getFeedback = interviewId =>
  API.get(`/feedback/${interviewId}`);