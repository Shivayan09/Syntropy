# <img src="client/public/logo.png" width="45" align="center" /> Syntropy

syntropy is a full-stack mock test platform for students preparing for semester exams, placements, and other timed assessments. It lets users create manual tests, generate AI-powered tests, attempt them in a timed interface, review results, track performance trends, upload syllabi, and manage AI test credits through paid plans.

## What The Product Does

- Register with email OTP verification and sign in with cookie-based auth
- Complete onboarding with academic details, preferences, and syllabus upload
- Create tests manually in both `mcq` and `subjective` formats
- Generate AI tests from selected subjects, difficulty, duration, marks, and student context
- Practice interview-focused aptitude sets in a dedicated Aptitude Lab (quant, reasoning, verbal, data interpretation) with untimed solution-first practice or timed scored rounds
- Attempt tests inside a timed interface with navigation, review flags, and auto-submit on expiry
- View result pages, answer review screens, attempt history, analytics, and leaderboard rankings
- Upload a syllabus PDF, parse it into structured subjects/units/topics, and reuse subjects while creating tests
- Buy monthly/annual AI-test plans or top-up credits through Razorpay

## Monorepo Structure

```text
.
├── client/   # Next.js frontend
└── server/   # Express + MongoDB API
```

## Tech Stack

### Frontend

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- Framer Motion
- Lucide React
- React Toastify

### Backend

- Node.js
- Express 5
- MongoDB + Mongoose
- JWT in `httpOnly` cookies
- Multer for uploads
- Cloudinary for file/avatar storage
- Nodemailer for OTP and password reset emails
- Razorpay for subscriptions and top-ups

### AI / Parsing

- Groq SDK
  - MCQ test generation
  - Subjective test generation
  - Subjective answer evaluation
- Google Gemini
  - Syllabus parsing into subjects and units
- `pdf-parse`
  - Extracting syllabus text from uploaded PDF files

## Key Functional Areas

### Authentication And Onboarding

- 3-step registration flow with email OTP verification
- Login, logout, `getMe`, forgot-password, and reset-password flows
- Protected routes plus onboarding gating before main app access
- Profile editing for name, username, phone, email, college, semester, role, and preferences

### Test Creation

- Manual test builder supports:
  - MCQs with 4 options and one correct answer
  - Subjective questions with marks, expected answer, and key points
- AI generation supports:
  - Multiple subjects
  - Difficulty selection
  - MCQ question count or subjective total marks
  - Duration
  - College and semester context

### Aptitude Lab

- Separate section dedicated to interview and placement aptitude practice
- Four sections: Quantitative Aptitude, Logical Reasoning, Verbal Ability, Data Interpretation
- Topic level selection inside each section, plus company/exam patterns (TCS NQT, Infosys, Wipro, Accenture, Cognizant, Capgemini, product companies, banking, CAT)
- One-click quick start presets for common rounds
- Practice mode: untimed, one question at a time, instant answer with the fastest approach and worked solution, not recorded as an attempt
- Timed mode: reuses the standard attempt, result, review, history and analytics flow
- Section and topic accuracy tracking with weak-topic detection

### Attempts, Results, And Review

- Timed attempt session with:
  - palette navigation
  - mark-for-review
  - clear answer
  - countdown timer
  - auto-submit when time ends
- MCQ attempts are scored instantly
- Subjective attempts are evaluated by AI and return marks plus feedback per answer
- Review pages show submitted answers and the correct/graded outcome

### Analytics And Leaderboard

- Dashboard with recent attempts, readiness score, best score, and subject map
- Analytics page with:
  - average accuracy
  - trend visualization
  - subject breakdown
  - weak subject/topic detection
  - retake lift
- Leaderboard ranks users by first-attempt performance only

### Plans And AI Credit System

- Free plan includes `3` total AI test generations
- Paid plans and top-ups are handled through a plan catalog on the server
- Manual test creation remains unlimited
- AI token status tracks:
  - included credits
  - bonus/top-up credits
  - refill cycle
  - next reset date

## Data Model Overview

Core MongoDB models:

- `User`
  - auth/profile fields
  - onboarding state
  - AI token / plan metadata
  - preferences and stats
- `Test`
  - `manual` or `generated`
  - `academic` or `aptitude` category
  - `mcq` or `subjective`
  - subjects, duration, questions, marks
  - aptitude metadata (sections, topics, target company pattern)
- `Attempt`
  - answers, score, accuracy, timing, first-attempt flag, status
- `Syllabus`
  - uploaded file URL, raw text, parsed subjects/units/topics
- `RegistrationOtp`
  - hashed OTP, expiry, attempt counter, verification state

## API Surface

Main route groups in `server/src/routes`:

- `/api/auth`
- `/api/user`
- `/api/test`
- `/api/attempt`
- `/api/syllabus`
- `/api/leaderboard`
- `/api/aptitude`
- `/api/payment`


## Running Locally

Install and run the frontend and backend separately.

### 1. Install dependencies

```bash
cd client
npm install

cd ../server
npm install
```

### 2. Start the backend

```bash
cd server
npm run dev
```

### 3. Start the frontend

```bash
cd client
npm run dev
```

### 4. Open the app

Frontend: `http://localhost:3000`  
Backend: `http://localhost:5000`

## Important Notes About The Current Codebase

- The current README previously described the backend as "planned", but the backend is already implemented and wired into the frontend.
- Syllabus upload UI accepts PDFs or images, but the current extraction flow is PDF-centric and uses `pdf-parse`; `tesseract.js` is installed but not currently driving the upload pipeline.
- The support/contact page is still frontend-only and does not submit to a backend service yet.
- There is no root-level workspace script; `client` and `server` are run independently.

## Current Product Positioning

This is not just a landing page or mock UI. It is an implemented full-stack exam practice system centered around:

- personalized onboarding
- manual and AI-generated mock tests
- timed attempts
- AI-assisted evaluation for subjective answers
- performance review and analytics
- syllabus-aware subject selection
- monetized AI credit plans

## License

No license file is currently present in the repository.

## Mobile App Status

- A new `mobile/` Expo + React Native app scaffold is now included in the repo.
- The Express auth flow now supports mobile-safe bearer tokens while keeping the existing cookie flow for the web app.
- Current mobile coverage includes login, OTP registration, dashboard, analytics, tests, history, and profile foundations.
- See `mobile/README.md` for setup steps and the remaining parity work before Play Store release.
