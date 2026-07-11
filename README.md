# CodeFlow Backend

Backend API for **CodeFlow** — an online coding / DSA practice platform with problem solving, code submission, AI-assisted learning, leaderboards, streaks, and a Problem of the Day (POTD) system.

Built with **Node.js**, **Express 5**, **MongoDB (Mongoose)**, and **Redis**.

---

## Features

- **Authentication & Users** — Register, login, logout, profile management with JWT + cookies, bcrypt password hashing, and role-based access (`user` / `admin`).
- **Problem Management** — CRUD for coding problems (admin only), fetch problems, fetch by ID, random problem, and problem-by-IDs batch lookup.
- **Code Submission & Execution** — Submit and run user code against test cases, per-user submission history, and rate limiting.
- **AI Integration** — Google Gemini (`@google/genai`) powered features: problem-related chat, mock interview chats, time/space complexity analysis, and chat history.
- **Problem of the Day (POTD)** — Scheduled via `node-cron` (`src/corn/potdScheduler.js`).
- **Leaderboard & Stats** — Global leaderboard, per-user solved count, difficulty breakdown (Easy / Medium / Hard), language stats, and solving streaks.
- **Redis** — Caching / session support via Redis Cloud.
- **CORS** — Multi-origin allow list (Vercel frontend + localhost dev ports).

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Runtime | Node.js |
| Framework | Express 5 |
| Database | MongoDB (Mongoose 8) |
| Cache | Redis |
| Auth | JWT, bcrypt, cookie-parser |
| AI | `@google/genai` (Gemini) |
| Media | Cloudinary |
| Scheduling | node-cron |
| Validation | validator |
| HTTP | axios |
| Dev | nodemon |

---

## Project Structure

```
CodeFlow-Backend/
├── package.json
└── src/
    ├── index.js                # App entry — Express setup, CORS, routes, DB/Redis init
    ├── config/
    │   ├── db.js               # MongoDB connection
    │   └── redis.js            # Redis client
    ├── controllers/
    │   ├── userAuthencate.js   # Auth + profile + leaderboard logic
    │   ├── problemMethods.js   # Problem CRUD + fetch + POTD
    │   ├── SubmissionMethods.js# Submit / run code, submission history
    │   └── AiMethods.js        # Gemini-powered chat, interview, complexity analysis
    ├── middleware/
    │   ├── userMiddleware.js   # JWT auth for regular users
    │   └── adminMiddleware.js  # Admin-only guard
    ├── models/
    │   ├── userModel.js
    │   ├── problemModel.js
    │   ├── SubmissionModel.js
    │   ├── ChatModel.js
    │   ├── MessageModel.js
    │   └── POTDModel.js
    ├── routes/
    │   ├── userAuth.js         # /user/*
    │   ├── problemRoute.js     # /problem/*
    │   ├── submissionRoute.js  # /submission/*
    │   └── AIRoute.js          # /ai/*
    ├── corn/
    │   └── potdScheduler.js    # Cron job for Problem of the Day
    └── utils/
        ├── problemUtility.js
        └── validator.js
```

---

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB instance (local or Atlas)
- Redis instance (local or Redis Cloud)

### Installation

```bash
git clone <repo-url>
cd CodeFlow-Backend
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
PORT=3000
DB_CONNET=<your-mongodb-connection-string>

# Redis
REDIS_HOST=<redis-host>
REDIS_PORT=<redis-port>
REDIS_PASSWORD=<redis-password>

# JWT
JWT_KEY=<your-jwt-secret>

# Google Gemini AI
GEMINI_API_KEY=<your-gemini-api-key>

# Cloudinary (if used for media uploads)
CLOUDINARY_CLOUD_NAME=<...>
CLOUDINARY_API_KEY=<...>
CLOUDINARY_API_SECRET=<...>
```

> Note: The env var for the DB connection string is spelled `DB_CONNET` (as used in `src/config/db.js`).

### Run

```bash
# Development (with nodemon)
npm run dev

# Production
npm start
```

Server starts on `http://localhost:<PORT>`.

---

## API Overview

Base URL: `http://localhost:<PORT>`

### Auth — `/user`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | — | Register a new user |
| POST | `/login` | — | Login and receive auth cookie |
| GET | `/logout` | User | Logout current user |
| GET | `/check` | User | Validate session, return user info |
| GET | `/getProfile` | User | Fetch profile |
| PUT | `/updateProfile` | User | Update profile |
| DELETE | `/deleteProfile` | User | Delete account |
| POST | `/adminRegister` | — | Register admin |
| GET | `/leaderboard` | — | Global leaderboard |
| GET | `/getProblemSolvedInfo` | User | Solved problems info for user |
| GET | `/potdDates` | User | Dates user has solved POTD |

### Problems — `/problem`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/create` | Admin | Create a problem |
| PUT | `/update/:id` | Admin | Update problem |
| DELETE | `/delete/:id` | Admin | Delete problem |
| GET | `/getAllProblems` | — | List all problems |
| GET | `/problemById/:id` | User | Get problem by ID |
| GET | `/problemSolvedByUser` | User | Problems solved by user |
| GET | `/submittedProblem/:pid` | User | User's submissions for a problem |
| GET | `/randomProblem` | User | Get a random problem |
| GET | `/solvedCount` | User | Solved problem count |
| GET | `/solvedList` | User | Solved problem list |
| GET | `/potd` | User | Problem of the Day |
| POST | `/getByIds` | User | Get multiple problems by IDs |

### Submissions — `/submission`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/submit/:id` | User | Submit code for a problem |
| POST | `/run/:id` | User | Run code against sample tests |
| GET | `/getProblemSubmissions/:id` | User | Get user's submissions for a problem |
| GET | `/getAllSubmissions` | User | Get all submissions for the user |

### AI — `/ai`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/problemChat` | User | Ask AI about a problem |
| POST | `/interviewWithAi` | User | Chat with AI interviewer |
| POST | `/analyzeComplexity` | User | Analyze time/space complexity |
| POST | `/interviewById` | User | Fetch a specific interview chat |
| GET | `/getAllInterviewChats` | User | List all interview chats |
| GET | `/history` | User | Chat history |

---

## Scripts

```bash
npm run dev     # Start with nodemon (auto reload)
npm start       # Start production server
```

---

## CORS

Allowed origins (configured in `src/index.js`):

- `https://code-flow-frontend.vercel.app` (production frontend)
- `http://localhost:5173` (Vite dev)
- `http://localhost:3000` (dev)

---

## License

ISC
