require("dotenv").config(); // Must be loaded first to use process.env variables
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/database");
const authRouter = require("./routes/auth");
const analysisRoutes = require("./routes/analysis");
const resumeRouter = require("./routes/resume");

const app = express();

// 1. Core Middlewares
const corsOptions = {
  // Allow the incoming Origin dynamically (helps when dev server origin may vary)
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  // Do not continue to next handler for preflight; return successful status
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Simple request logger for debugging CORS/preflight
app.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.originalUrl} - Origin: ${req.headers.origin || '-'} - Headers: ${Object.keys(req.headers).join(',')}`);
  next();
});

// Explicitly handle OPTIONS preflight as a fallback to ensure CORS headers
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    const origin = req.headers.origin || '*';
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', req.headers['access-control-request-headers'] || 'Content-Type,Authorization');
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json()); // Parses incoming JSON payloads
app.use(cookieParser()); // Parses cookies so req.cookies works in auth middleware

// 2. Base Routes
app.use("/api", authRouter);
app.use("/api", analysisRoutes);
app.use("/api", resumeRouter);

// Lightweight health endpoint — does not depend on DB
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// 3. Database Connection & Server Initialization
// Default to port 7777 in development to avoid macOS port conflicts
const PORT = process.env.PORT || 7777;

// Start server regardless so we can debug CORS and preflight even if DB is down
app.listen(PORT, () => {
  console.log(`📡 Server is running smoothly on port ${PORT}`);
});

connectDB()
  .then(() => {
    console.log("🚀 Database connected successfully!");
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err.message);
    // Do not exit process — keep server running for debugging
  });