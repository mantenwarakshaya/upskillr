# Upskillr

Upskillr is a full-stack career development platform that combines AI-powered resume analysis, skill gap detection, job market analysis, and interview preparation into one polished application.

## Key Features

- Resume analysis with file parsing and intelligent feedback
- Skill gap analysis and roadmap generation
- Job description analysis and personalized recommendations
- Interview practice with speech-to-text and AI-driven mock interview support
- User authentication, profile management, and session tracking
- React frontend served by an Express backend for production deployment

## Tech Stack

- Backend: Node.js, Express, MongoDB, Mongoose
- Frontend: React, Vite, Tailwind CSS
- AI / Voice: AssemblyAI, Google Generative AI, file parsing tools
- Authentication: JWT, cookie-based sessions

## Repository Structure

- `backend/` - Express API server and business logic
  - `app.js` - backend entrypoint and route registration
  - `config/` - environment and database configuration
  - `controllers/` - request handlers for each feature
  - `models/` - MongoDB data models
  - `routes/` - API route definitions
  - `services/` - reusable AI, speech, and interview services
  - `utils/` - validation, helpers, and analysis utilities
- `frontend/` - React application
  - `src/` - React app source code and UI components
  - `public/` - static assets
  - `vite.config.js` - Vite configuration

## Prerequisites

- Node.js v22 or later
- npm v10 or later
- MongoDB instance or MongoDB Atlas connection

## Local Setup

1. Clone the repository

```bash
git clone <repo-url>
cd upskillr-main
```

2. Install backend dependencies

```bash
cd backend
npm install
```

3. Install frontend dependencies

```bash
cd ../frontend
npm install
```

4. Configure environment variables

Create a `.env` file in `backend/` with at least the following:

```env
MONGO_URI=<your-mongodb-connection-string>
PORT=7777
```

5. Build the frontend for production (optional)

```bash
cd frontend
npm run build
```

6. Run the backend server

```bash
cd ../backend
npm run dev
```

> In development, you can also run the frontend separately with `npm run dev` from `frontend/`.

## API Endpoints

- `POST /api/auth` - authentication routes
- `POST /api/resume` - resume upload and analysis
- `POST /api/gap` - skill gap analysis requests
- `POST /api/job` - job description analysis and search
- `POST /api/interview` - interview practice and voice interview features
- `GET /health` - health check endpoint

## Development Workflow

- Frontend development: `cd frontend && npm run dev`
- Backend development: `cd backend && npm run dev`
- Linting frontend: `cd frontend && npm run lint`

## Production Deployment

1. Build frontend assets:

```bash
cd frontend
npm run build
```

2. Start the backend server, which serves the compiled frontend from `frontend/dist`:

```bash
cd backend
npm start
```

## Notes

- The backend serves static frontend assets from `frontend/dist` in production mode.
- Ensure your `.env` file is not committed to version control.
- Adjust CORS and origin handling in `backend/app.js` if you deploy the frontend and API on separate domains.

## License

This project is provided under the `ISC` license.
