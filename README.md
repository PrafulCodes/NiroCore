# 🧠 NiroCore — Smart Subscription Management System

## 📌 Overview
NiroCore is a full-stack web app that helps users track recurring subscriptions, avoid missed renewals, and reduce unnecessary spending.

Instead of manually checking multiple apps, bills, and payment histories, NiroCore gives one central dashboard to:
- Add subscriptions manually
- Extract subscription details from screenshots using OCR
- Monitor upcoming renewals and high-risk renewals
- Send reminders through email, SMS, and WhatsApp

It is built for students, working professionals, and everyday users who want better control over recurring payments.

## 🚨 Problem Statement
Many people lose money every month because subscription management is fragmented.

Common pain points:
- Users forget renewal dates
- Auto-debits continue for unused services
- No single place to view all subscriptions
- Multiple platforms (OTT, music, productivity, etc.) make tracking difficult
- Users realize spending only after bank statements arrive

## 💡 Solution
NiroCore solves this by providing a unified subscription control center.

Core idea:
**One place to track, manage, and control subscriptions.**

With NiroCore, users can quickly capture recurring charges, monitor spend trends, and receive reminders before money is deducted.

## ✨ Features
Features below are extracted from the actual implementation.

- Google sign-in via Supabase OAuth
- Protected app routes (dashboard, add, scan, notifications, account)
- Manual subscription creation with validation
- OCR-based extraction from uploaded billing screenshots (`PNG/JPG`, max `10MB`)
- Confirmation screen to verify OCR-extracted fields before saving
- Subscription dashboard with:
  - Monthly spend
  - Yearly spend (cycle-adjusted)
  - Upcoming renewals (next 7 days)
  - High-risk renewals (next 3 days)
  - Category filters and risky/cancelled filters
- Subscription detail page with:
  - Reminder history
  - Service-specific cancel steps (for known services)
  - Annual cost estimation
- Reminder center to toggle per-subscription reminder channels
- Multi-channel reminder delivery:
  - Email (`Nodemailer`)
  - SMS (`Twilio`)
  - WhatsApp (`Twilio Sandbox`)
- Automatic renewal-date rollover for past-due active subscriptions
- Daily scheduler (`node-cron`) that checks renewals and sends reminders
- Demo reset endpoint to clear subscription and reminder data

## 🏗️ Architecture Overview
NiroCore uses a client-server architecture with a relational data model.

### Frontend (`client`)
- React + Vite single-page app
- Handles authentication, forms, dashboard rendering, reminders UI, and OCR upload UI
- Uses Axios to call backend APIs
- Uses Supabase for authentication session management

### Backend (`server`)
- Express API server
- Handles CRUD for subscriptions, OCR processing, reminder delivery, user phone sync, and reminder logs
- Uses middleware for validation, rate limiting, upload filtering, and centralized error handling

### Database (`Prisma + SQLite`)
- Stores users, subscriptions, and reminder logs
- Maintains relations between users and subscriptions
- Persists notification attempts and status

### Typical Flow
1. User signs in with Google
2. User adds a subscription manually or via OCR
3. Subscription is stored in database and linked to user email
4. Dashboard calculates spending and renewal risk
5. Scheduler/manual trigger sends reminders
6. Reminder logs are stored and shown in UI

## 🖥️ Tech Stack
- **React 19 + Vite**: Fast, component-driven UI and developer-friendly build tooling
- **Tailwind CSS 4**: Utility-first styling for responsive pages and rapid UI iteration
- **Framer Motion**: Smooth page and component transitions
- **Supabase Auth**: Easy OAuth integration (Google) and client session management
- **Axios**: Clean API request/response handling with centralized interceptors
- **Node.js + Express 5**: REST API layer for subscriptions, OCR, reminders, and user operations
- **Prisma ORM**: Type-safe database access and schema-driven modeling
- **SQLite**: Lightweight local relational database for development/demo
- **Tesseract.js**: OCR extraction from billing screenshots
- **Nodemailer**: Email reminder delivery
- **Twilio**: SMS and WhatsApp reminder delivery
- **node-cron**: Daily scheduled reminder processing
- **express-validator + express-rate-limit + multer + morgan + cors**: API safety, validation, upload handling, and observability

## ⚙️ How It Works (Step-by-Step)
1. User signs in using Google OAuth on the login page.
2. Frontend receives session data from Supabase and unlocks protected routes.
3. User adds a subscription:
   - Manual form (`/add`) or
   - Screenshot OCR flow (`/scan` → `/confirm`)
4. Frontend sends data to backend API (`/api/subscriptions`).
5. Backend validates input, links/creates user by email, and stores subscription.
6. Dashboard fetches list + stats from `/api/subscriptions` and `/api/subscriptions/stats`.
7. Reminder engine sends notifications through enabled channels.
8. Reminder logs are saved and shown in Reminder Center and Subscription Detail pages.

## 🔌 API Snapshot
Main backend routes exposed by the current server:

- `GET /api/health` - health + DB status
- `GET /api/demo/reset` - clears subscriptions and reminder logs (demo utility)
- `GET /api/subscriptions` - list subscriptions (also runs auto-renewal rollover)
- `GET /api/subscriptions/stats` - dashboard aggregates
- `GET /api/subscriptions/:id` - single subscription details
- `POST /api/subscriptions` - create subscription
- `PATCH /api/subscriptions/:id` - update subscription fields
- `DELETE /api/subscriptions/:id` - delete subscription
- `POST /api/ocr/extract` - OCR extraction from uploaded image
- `POST /api/reminders/trigger/:subscriptionId` - manual reminder trigger
- `GET /api/reminders` - all reminder logs
- `GET /api/reminders/:subscriptionId` - reminder logs for one subscription
- `POST /api/user/update-phone` - create/update user phone
- `GET /api/user/:email` - fetch user profile by email

## 📂 Project Structure
```text
NiroCore/
├── client/                      # React frontend
│   ├── src/
│   │   ├── api/client.js        # Axios client + global error handling
│   │   ├── contexts/AuthContext.jsx
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # App screens (dashboard, scan, add, etc.)
│   │   ├── lib/supabase.js      # Supabase client config
│   │   └── utils/formatUtils.js
│   └── package.json
├── server/                      # Express backend
│   ├── index.js                 # API entrypoint
│   ├── routes/                  # API routes
│   ├── middleware/              # Validation, upload, error handlers
│   ├── services/                # OCR, reminder channels, templates, renewal logic
│   ├── prisma/
│   │   ├── schema.prisma        # Data model
│   │   └── migrations/          # DB migration history
│   ├── lib/prisma.js            # Prisma client
│   └── package.json
├── test_ocr.mjs                 # OCR parser test utility
└── README.md
```

## 🚀 Setup Guide (Beginner Friendly)

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd "Project Exhibition"
```

### 2. Install dependencies
Install frontend and backend packages separately.

```bash
cd server
npm install

cd ../client
npm install
```

### 3. Environment variables setup
Create two files:
- `server/.env`
- `client/.env`

Use the templates below.

#### `server/.env`
```env
PORT=5000
DATABASE_URL="file:./dev.db"

EMAIL_USER="your_gmail_address@gmail.com"
EMAIL_PASS="your_gmail_app_password"

TWILIO_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_TOKEN="your_twilio_auth_token"
TWILIO_PHONE="+1xxxxxxxxxx"
```

#### `client/.env`
```env
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your_supabase_anon_key"
```

### 4. Initialize database
From the `server` directory:

```bash
npx prisma migrate dev
npx prisma generate
```

### 5. Run locally
Start backend and frontend in separate terminals.

Terminal 1:
```bash
cd server
npm run dev
```

Terminal 2:
```bash
cd client
npm run dev
```

Then open the frontend URL shown by Vite (usually `http://localhost:5173`).

## 📝 Current Implementation Notes
- `POST /api/subscriptions` currently requires `userEmail` in request body. Manual add flow sends this value.
- Reminder phone validation is strict for Indian format: `+91XXXXXXXXXX`.
- Client API base URL is currently hardcoded to `http://localhost:5000` in `client/src/api/client.js`.
- CORS in backend currently allows local frontend origins matching `http://localhost:<4 digits>`.

### 6. Deployment (current status)
There is no deployment config committed yet (no Vercel/Render/Fly config files).

Recommended production path:
- Frontend: Vercel or Netlify
- Backend: Render, Railway, or Fly.io
- DB: Upgrade from SQLite to PostgreSQL for multi-user production usage

## 🔐 Environment Variables Explained

### Backend (`server/.env`)
- `PORT`
  - What: Server listening port
  - Why: Defines where Express runs
  - Example: `5000`

- `DATABASE_URL`
  - What: Prisma database connection string
  - Why: Required for all DB operations
  - Example (SQLite): `file:./dev.db`

- `EMAIL_USER`
  - What: Sender email account for reminder emails
  - Why: Authenticates Gmail SMTP in Nodemailer
  - Example: `yourname@gmail.com`

- `EMAIL_PASS`
  - What: App password for the sender Gmail account
  - Why: Required by Gmail SMTP auth
  - Example: `abcd efgh ijkl mnop`

- `TWILIO_SID`
  - What: Twilio account SID
  - Why: Initializes Twilio client for SMS/WhatsApp
  - Example: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

- `TWILIO_TOKEN`
  - What: Twilio auth token
  - Why: Authenticates Twilio API requests
  - Example: `your_twilio_token`

- `TWILIO_PHONE`
  - What: Twilio phone number used as sender for SMS
  - Why: Required when sending SMS
  - Example: `+1xxxxxxxxxx`

### Frontend (`client/.env`)
- `VITE_SUPABASE_URL`
  - What: Supabase project URL
  - Why: Connects frontend auth client to your Supabase project
  - Example: `https://xyzcompany.supabase.co`

- `VITE_SUPABASE_ANON_KEY`
  - What: Supabase public anon key
  - Why: Allows client-side auth/session operations
  - Example: `eyJhbGciOi...`

## 📊 Future Improvements
- AI-based spending insights and monthly trend forecasting
- Auto-detection of subscriptions from transaction feeds (with user consent)
- Budget tracking and alert thresholds
- Native mobile app (Android/iOS)
- Granular reminder timing rules per channel
- Team/family shared subscription spaces

## 🎯 Why This Project Matters
NiroCore addresses a practical daily problem: recurring payments users forget to track.

Why it is impactful:
- Reduces silent money leakage
- Improves financial awareness
- Encourages proactive subscription decisions
- Demonstrates a scalable SaaS model for personal finance tooling

## 🧠 Learnings & Concepts Used
- OAuth authentication and session handling
- Protected route architecture in React
- REST API design with layered backend structure
- File upload + OCR pipelines
- Data modeling with Prisma relations
- Input validation and API rate limiting
- Error handling strategy (client interceptors + server middleware)
- Scheduled jobs and async background workflows
- Multi-channel notification orchestration

## 🤝 Contribution Guide
Contributions are welcome.

1. Fork the repository
2. Create a feature branch
3. Make focused, testable changes
4. Run frontend and backend locally
5. Open a pull request with:
   - What changed
   - Why it changed
   - Screenshots or API examples (if relevant)

Suggested contribution areas:
- Better OCR accuracy
- New reminder channels
- Improved analytics and data visualization
- Test coverage and CI workflows

## 📜 License
No license file is currently included in this repository.

## 👨‍💻 Author
- **Name:** Praful Mohite
- **Role:** Computer Engineering Student & Builder
