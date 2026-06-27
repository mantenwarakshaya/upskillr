require("dotenv").config(); // Must be loaded first to use process.env variables
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/database");

// Route Imports
const authRouter = require("./routes/auth");
const resumeRouter = require("./routes/resumeAnalysis");
const analysisRoutes = require("./routes/gapAnalysis");
const jobAnalysisRouter = require("./routes/jobAnalysis");
const interviewRoutes = require("./routes/interview");

const app = express();

// 1. Core Middlewares
const corsOptions = {
  // Dynamically reflect back the requesting origin to fully support credentials
  origin: (origin, callback) => {
    // Allows mobile apps, curl, or local testing tools without an origin header
    if (!origin) return callback(null, true); 
    callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Simple request logger for debugging API hits and CORS issues
app.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.originalUrl} - Origin: ${req.headers.origin || '-'}`);
  next();
});

app.use(express.json()); // Parses incoming JSON payloads
app.use(cookieParser()); // Parses cookies so req.cookies works in auth middleware

// 2. Base Routes
// We structure these cleanly to map with your backend architecture
app.use("/api", authRouter);
app.use("/api/resume", resumeRouter);
app.use("/api/gap", analysisRoutes);
app.use("/api/job", jobAnalysisRouter);
app.use("/api/interview", interviewRoutes);

// Lightweight health endpoint — does not depend on DB
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date() });
});

// 3. Database Connection & Server Initialization
const PORT = process.env.PORT || 7777;

// Start server regardless so we can debug configuration even if DB is down
app.listen(PORT, () => {
  console.log(`📡 Server is running smoothly on port ${PORT}`);
});

// Establish MongoDB Connection
connectDB()
  .then(() => {
    console.log("🚀 Database connected successfully!");
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err.message);
  });