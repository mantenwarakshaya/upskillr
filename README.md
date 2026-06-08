🚀 Upskillr

AI-Powered Career Growth Platform

Upskillr helps users analyze their resumes, identify skill gaps for target roles, generate personalized learning roadmaps, and track career progress using AI.

----------------------------------------------------------------------------

📌 Features

📄 Resume Analyzer
Upload a resume and extract structured information using AI.

* Skills
* Education
* Experience
* Projects
* Certifications
* Summary


🎯 Skill Gap Analysis
Compare resume skills against a target role and identify:

* Match Percentage
* Missing Skills
* Strengths
* Improvement Areas

🛣️ AI Career Roadmap
Generate a personalized roadmap based on:

* Target Role
* Missing Skills
* Current Skill Level

📊 Analysis History
Store previous analyses and track progress over time.

🔐 Authentication
* Signup
* Login
* JWT Authentication
* Protected Routes

----------------------------------------------------------------------------

🏗️ System Architecture

Frontend (React + Vite)
        │
        ▼
Backend API (Express.js)
        │
        ▼
Controllers
        │
        ▼
Services / Utils
        │
        ▼
Gemini AI + MongoDB

----------------------------------------------------------------------------

📁 Project Structure

UPSKILLR
│
├── backend
│   ├── config
│   │   └── database.js
│   │
│   ├── controllers
│   │   ├── resumeController.js
│   │   └── jobAnalysisController.js
│   │
│   ├── data
│   │   └── roles.js
│   │
│   ├── middleware
│   │   ├── auth.js
│   │   └── upload.js
│   │
│   ├── models
│   │   ├── user.js
│   │   └── JobAnalysis.js
│   │
│   ├── routes
│   │   ├── auth.js
│   │   ├── resume.js
│   │   ├── analysis.js
│   │   └── jobAnalysis.js
│   │
│   ├── services
│   │   └── jobAnalysisService.js
│   │
│   ├── utils
│   │   ├── resumeParser.js
│   │   ├── extractResumeData.js
│   │   ├── resumeLLMAnalyzer.js
│   │   ├── skillAnalyzer.js
│   │   ├── jobAnalyzer.js
│   │   ├── roadmapGenerator.js
│   │   ├── tavilySearch.js
│   │   ├── jobSearch.js
│   │   └── validation.js
│   │
│   └── app.js
│
└── frontend
    ├── src
    │
    ├── components
    │   ├── AI
    │   │   ├── ResumeAnalyzer
    │   │   ├── GapAnalysis
    │   │   └── JobAnalysis
    │   │
    │   ├── Dashboard
    │   ├── Profile
    │   ├── Sidebar
    │   └── Common
    │
    ├── pages
    │   ├── Landing
    │   ├── Login
    │   ├── Signup
    │   ├── ForgotPassword
    │   └── VerifyEmail
    │
    ├── AuthProvider.jsx
    ├── ProtectedRoute.jsx
    ├── App.jsx
    └── main.jsx

----------------------------------------------------------------------------

🔄 Feature Flowcharts

1️⃣ Authentication Flow
Files Involved

    frontend/pages/Login
    frontend/pages/Signup

    backend/routes/auth.js
    backend/middleware/auth.js
    backend/models/user.js

    User Signup / Login
            ↓
    auth.js Route Handler
            ↓
    user.js Model (DB Check / Create User)
            ↓
    JWT Token Generation
            ↓
    auth.js Middleware (Protected Routes)
            ↓
    Access Granted to Dashboard


2️⃣ Resume Analyzer Flow
Files Involved

    frontend/components/AI/ResumeAnalyzer

    backend/routes/resume.js
    backend/controllers/resumeController.js

    backend/utils/resumeParser.js
    backend/utils/extractResumeData.js
    backend/utils/resumeLLMAnalyzer.js

    backend/middleware/upload.js

    User Uploads Resume (PDF)
            ↓
    upload.js (File Handling)
            ↓
    resumeController.js
            ↓
    resumeParser.js (Extract Raw Text)
            ↓
    extractResumeData.js (Structure Data)
            ↓
    resumeLLMAnalyzer.js (Gemini AI Processing)
            ↓
    Structured Resume Output
            ↓
    Frontend Displays Results


3️⃣ Skill Gap Analysis Flow
Files Involved

    frontend/components/AI/GapAnalysis

    backend/routes/analysis.js

    backend/utils/skillAnalyzer.js
    backend/utils/jobAnalyzer.js

    backend/data/roles.js

    User Selects Target Role
            ↓
    roles.js (Role Skill Mapping)
            ↓
    skillAnalyzer.js (Compare Skills)
            ↓
    jobAnalyzer.js (Gap Calculation)
            ↓
    Generate:
        → Match Percentage
        → Missing Skills
        → Strengths
            ↓
    Frontend Displays Analysis

4️⃣ Career Roadmap Flow
Files Involved

    backend/utils/roadmapGenerator.js

    Missing Skills + Target Role
            ↓
    roadmapGenerator.js
            ↓
    Gemini AI Processing
            ↓
    Learning Phases Generated
            ↓
    Topics + Projects + Timeline
            ↓
    Final Career Roadmap


5️⃣ Job Analysis Flow
Files Involved

    frontend/components/AI/JobAnalysis

    backend/routes/jobAnalysis.js

    backend/controllers/jobAnalysisController.js

    backend/services/jobAnalysisService.js

    backend/utils/tavilySearch.js
    backend/utils/jobSearch.js

    User Enters Job Role
            ↓
    jobAnalysis.js Route
            ↓
    jobAnalysisController.js
            ↓
    jobAnalysisService.js
            ↓
    tavilySearch.js (Web Job Data)
            ↓
    jobSearch.js (Filter & Structure Jobs)
            ↓
    Extract:
        → Required Skills
        → Job Trends
        → Market Insights
            ↓
    Frontend Displays Results

6️⃣ Analysis History Flow
Files Involved

    backend/models/JobAnalysis.js
    backend/models/user.js

    Analysis Completed (Any Feature)
            ↓
    Save Result in JobAnalysis Model
            ↓
    Stored in MongoDB
            ↓
    Linked to User Profile
            ↓
    Frontend Dashboard Fetches History
            ↓
    User Views Past Analyses

----------------------------------------------------------------------------

🛠️ Tech Stack

* Frontend
    React.js
    Vite
    React Router
    Context API
    CSS
* Backend
    Node.js
    Express.js
    MongoDB
    Mongoose
    JWT
    Multer
    Bcrypt
* AI
    Gemini API
    Tavily Search API
* Database
    MongoDB Atlas

----------------------------------------------------------------------------

⚙️ Environment Variables

PORT=7777

MONGO_URI=

JWT_SECRET=

GEMINI_API_KEY=

GAP_ANALYSIS_GEMINI_KEY=

TAVILY_API_KEY=

----------------------------------------------------------------------------

🚀 Installation

* Backend

    cd backend

    npm install

    npm run dev

* Frontend

    cd frontend

    npm install

    npm run dev

----------------------------------------------------------------------------

👨‍💻 Author

Mantenwar Akshaya

Built as an AI-powered career guidance platform to help users move from:

    Resume
    ↓
    Analysis
    ↓
    Skill Gap Detection
    ↓
    Career Roadmap
    ↓
    Career Growth

