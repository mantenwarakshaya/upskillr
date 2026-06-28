require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

const connectDB = require("./config/database");

// Route Imports
const authRouter = require("./routes/auth");
const resumeRouter = require("./routes/resumeAnalysis");
const analysisRoutes = require("./routes/gapAnalysis");
const jobAnalysisRouter = require("./routes/jobAnalysis");
const interviewRoutes = require("./routes/interview");

const app = express();

// ============================
// Middlewares
// ============================

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

app.use((req, res, next) => {
  console.log(
    `[REQ] ${req.method} ${req.originalUrl} - Origin: ${
      req.headers.origin || "-"
    }`
  );
  next();
});

app.use(express.json());
app.use(cookieParser());

// ============================
// API Routes
// ============================

app.use("/api", authRouter);
app.use("/api/resume", resumeRouter);
app.use("/api/gap", analysisRoutes);
app.use("/api/job", jobAnalysisRouter);
app.use("/api/interview", interviewRoutes);

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date(),
  });
});

// ============================
// Serve React Frontend
// ============================

const frontendPath = path.join(__dirname, "../frontend/dist");

app.use(express.static(frontendPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// ============================
// Start Server
// ============================

const PORT = process.env.PORT || 7777;

app.listen(PORT, () => {
  console.log(`📡 Server running on port ${PORT}`);
});

// ============================
// Connect Database
// ============================

connectDB()
  .then(() => {
    console.log("🚀 Database connected successfully!");
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err.message);
  });