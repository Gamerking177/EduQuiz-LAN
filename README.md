<div align="center">

<h1>🎮 EduQuiz LAN</h1>

<p><strong>Real-time, LAN-based Interactive Quiz Platform for Classrooms</strong></p>

<p>
  <img src="https://img.shields.io/badge/React_Native-0.83.4-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Expo-SDK_55-000020?style=for-the-badge&logo=expo&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-18.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Socket.IO-4.x-010101?style=for-the-badge&logo=socketdotio&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-6.x-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
</p>

<p>
  <img src="https://img.shields.io/badge/Platform-Android%20%7C%20iOS%20%7C%20Web-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Network-LAN%20%2F%20Wi--Fi%20Only-orange?style=for-the-badge" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" />
</p>

<br/>

> **EduQuiz LAN** is a Kahoot-style interactive quiz app that works entirely over your local Wi-Fi — **no internet required**. Educators host live quiz sessions; students join on their phones using a room code. Real-time leaderboards, automated scoring, and instant result reports.

</div>

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🏗 Architecture](#-architecture)
- [📁 Project Structure](#-project-structure)
- [🛠 Tech Stack](#-tech-stack)
- [⚙️ Prerequisites](#️-prerequisites)
- [🚀 Getting Started](#-getting-started)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend (App) Setup](#3-frontend-app-setup)
  - [4. Environment Variables](#4-environment-variables)
  - [5. Running the App](#5-running-the-app)
- [📱 App Screens](#-app-screens)
- [🔌 Socket.IO Events](#-socketio-events)
- [🗄️ Database Schema](#️-database-schema)
- [🔐 Security](#-security)
- [📊 Quiz JSON Format](#-quiz-json-format)
- [📤 CSV Export Format](#-csv-export-format)
- [🧪 Testing](#-testing)
- [🗺️ Roadmap](#️-roadmap)
- [🤝 Contributing](#-contributing)
- [👨‍💻 Author](#-author)

---

## ✨ Features

### 🎓 For Educators (Host)
- **Create Quizzes** — Build quizzes with MCQ (4 options) and True/False question formats
- **Import from JSON** — Import pre-built quiz data instantly from a `.json` file
- **Custom Settings** — Configure total duration, max players, question order (Sequential/Random), and late-join policy
- **Game Lobby** — Share a 6-character room code; watch players join in real-time
- **Live Leaderboard** — See every player's score update in real-time as they submit answers
- **Answer Key** — View all correct answers during/after the session
- **End Game** — End the session at any time and instantly send results to all players
- **Export CSV** — Download a `.csv` file of the final standings shared via the device share sheet

### 🎮 For Students (Player)
- **Join Instantly** — Enter the 6-character room code; room auto-verifies as you type (Kahoot UX)
- **Exam Interface** — Navigate questions freely with Prev/Next controls; change answers before submitting
- **Global Timer** — Automatic submission when the time limit expires
- **Instant Results** — See your score, rank, correct/wrong/skipped breakdown immediately
- **Answer Review** — Question-by-question review with color-coded correct/incorrect/skipped cards

### ⚡ System
- **100% Offline** — Works entirely over local Wi-Fi with zero internet dependency
- **Cross-Platform** — Single codebase runs on Android, iOS, and Web
- **Anti-Cheat** — MCQ options are shuffled before delivery; correct answers are never sent to clients
- **Auto-Login** — JWT tokens persisted in AsyncStorage restore sessions on app relaunch
- **Network Detection** — Real-time Wi-Fi status monitoring on Home and Join screens
- **Late Join** — Players can join an active game mid-session and immediately receive the exam

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                  LOCAL WI-FI NETWORK (192.168.x.x)              │
│                                                                  │
│  ┌─────────────────┐              ┌──────────────────────────┐  │
│  │   HOST DEVICE    │              │   PLAYER DEVICES (×N)    │  │
│  │  React Native   │              │   React Native (Expo)    │  │
│  │  Expo Router    │              │   Expo Router            │  │
│  │  Zustand Store  │◄────────────►│   Zustand Store          │  │
│  │  React Query    │  Socket.IO   │   React Query            │  │
│  │  Axios Client   │   + HTTP     │   Axios Client           │  │
│  └────────┬────────┘              └────────────┬─────────────┘  │
│           │                                    │                 │
│           └──────────────┬─────────────────────┘                │
│                          ▼                                       │
│          ┌───────────────────────────────────┐                  │
│          │      NODE.JS BACKEND (Port 5000)   │                  │
│          │  Express.js REST API               │                  │
│          │  Socket.IO Engine                  │                  │
│          │  JWT Auth Middleware               │                  │
│          └───────────────┬───────────────────┘                  │
│                          │ Mongoose ODM                          │
│          ┌───────────────▼───────────────────┐                  │
│          │         MONGODB DATABASE           │                  │
│          │  users · games · questions         │                  │
│          │  players                           │                  │
│          └───────────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────────┘
```

**Communication Flows:**
- `HTTP/REST` — Authentication, game creation, game info queries (via Axios)
- `WebSocket (Socket.IO)` — All real-time game events (player join, game start, exam delivery, leaderboard, results)

---

## 📁 Project Structure

```
EduQuiz LAN/                          ← Root
├── App/                              ← React Native (Expo) Frontend
│   ├── app/                          ← Expo Router screens (auto-registered routes)
│   │   ├── _layout.jsx               ← Root layout: providers, navigation stack, fonts
│   │   ├── index.jsx                 ← Splash screen + session auto-restore
│   │   ├── login.jsx                 ← Login with real-time validation
│   │   ├── register.jsx              ← Registration with real-time validation
│   │   ├── home.jsx                  ← Dashboard: Create/Join game, network status
│   │   ├── create-quiz.jsx           ← Quiz builder: questions, settings, JSON import
│   │   ├── join-game.jsx             ← Join via room code (auto-verify UX)
│   │   ├── waiting-area.jsx          ← Pre-game lobby for host and players
│   │   ├── question-panel.jsx        ← Active exam screen with timer
│   │   ├── host-live-leaderboard.jsx ← Real-time leaderboard for host
│   │   ├── host-answer-key.jsx       ← Answer key reference for host
│   │   ├── HostFinalResultsScreen.jsx← Final standings + CSV export
│   │   └── player-results.jsx        ← Personal result report for player
│   │
│   ├── components/                   ← Reusable UI components
│   │   ├── ActionCard.jsx            ← Home screen action cards (Create/Join)
│   │   ├── AppLogo.jsx               ← SVG app logo component
│   │   ├── CategorySelector.jsx      ← Scrollable category chip selector
│   │   ├── CounterInput.jsx          ← Number input with +/- controls
│   │   ├── CustomAlert.jsx           ← Custom modal alert dialog
│   │   ├── CustomDialog.jsx          ← Custom dialog with type variants
│   │   ├── CustomLogoutPopup.jsx     ← Logout confirmation popup
│   │   ├── CustomToast.jsx           ← Animated toast notification
│   │   ├── EndGameModal.jsx          ← End game confirmation modal
│   │   ├── GameSettings.jsx          ← Game configuration panel
│   │   ├── Header.jsx                ← Screen header with room code
│   │   ├── OptionCard.jsx            ← Quiz answer option button
│   │   ├── PlayerGrid.jsx            ← Leaderboard player card
│   │   ├── QuestionCard.jsx          ← Editable question card (create-quiz)
│   │   ├── QuestionHeader.jsx        ← Question number + timer display
│   │   ├── QuizEndPopup.jsx          ← Post-exam "View Results" popup
│   │   ├── QuizInput.jsx             ← Styled text input for quiz forms
│   │   ├── SegmentedToggle.jsx       ← Two-option toggle switch
│   │   └── StatsGrid.jsx             ← Stats display grid (player count, questions)
│   │
│   ├── store/
│   │   └── useGameStore.js           ← Zustand global state store
│   ├── utils/
│   │   ├── api.js                    ← Axios instance + all API functions
│   │   ├── socket.js                 ← Socket.IO client service
│   │   └── helper.js                 ← Utility functions (deviceId, etc.)
│   ├── assets/fonts/                 ← Manrope font family (Bold/SemiBold/Medium/Regular)
│   ├── global.css                    ← NativeWind base styles
│   ├── tailwind.config.js            ← Tailwind configuration
│   ├── babel.config.js               ← Babel configuration
│   ├── app.json                      ← Expo app configuration
│   └── package.json                  ← Frontend dependencies
│
├── backend/                          ← Node.js + Express.js Backend
│   ├── server.js                     ← Entry point: HTTP server + Socket.IO init
│   ├── app.js                        ← Express app: middleware, routes
│   ├── config/
│   │   └── db.js                     ← MongoDB connection (Mongoose)
│   ├── middlewares/
│   │   └── auth.middleware.js        ← JWT verification middleware
│   ├── modules/
│   │   ├── auth/                     ← User auth (register/login/logout)
│   │   │   ├── auth.model.js         ← User Mongoose schema
│   │   │   ├── auth.controller.js    ← Auth business logic
│   │   │   └── auth.routes.js        ← POST /api/auth/*
│   │   ├── game/                     ← Game session management
│   │   │   ├── game.model.js         ← Game Mongoose schema
│   │   │   ├── game.controller.js    ← Game business logic
│   │   │   └── game.routes.js        ← POST/GET /api/game/*
│   │   ├── question/                 ← Quiz questions
│   │   │   ├── question.model.js     ← Question Mongoose schema
│   │   │   └── question.controller.js
│   │   ├── player/                   ← Session player tracking
│   │   │   ├── player.model.js       ← Player Mongoose schema
│   │   │   └── player.controller.js
│   │   └── user/                     ← User profile management
│   ├── socket/
│   │   ├── index.js                  ← Socket.IO initialization
│   │   └── game.socket.js            ← All game Socket.IO event handlers
│   ├── routes/                       ← Route aggregator
│   ├── utils/                        ← Backend utility functions
│   ├── .env                          ← Environment variables (not committed)
│   └── package.json                  ← Backend dependencies
│
├── README.md                         ← This file
├── .gitignore                        ← Git ignore rules
└── setup-backend.ps1                 ← PowerShell backend scaffolding script
```

---

## 🛠 Tech Stack

### Frontend (App/)

| Technology | Version | Purpose |
|---|---|---|
| **React Native** | 0.83.4 | Cross-platform mobile framework |
| **Expo** | SDK ~55.x | Managed workflow, device APIs |
| **Expo Router** | ~55.0.x | File-based navigation (Next.js style) |
| **NativeWind** | 4.2.x | Tailwind CSS utility classes for React Native |
| **Zustand** | 5.0.x | Lightweight global state management |
| **TanStack React Query** | 5.90.x | Server-state caching, mutations, queries |
| **Socket.IO Client** | 4.8.x | Real-time WebSocket communication |
| **Axios** | 1.13.x | HTTP REST API client |
| **AsyncStorage** | 2.2.0 | Persistent local storage (JWT tokens) |
| **React Native Reanimated** | 4.2.x | GPU-accelerated animations |
| **expo-network** | ~55.0.x | Wi-Fi detection and IP address |
| **expo-linear-gradient** | ~55.0.x | Gradient backgrounds |
| **expo-document-picker** | ~55.0.x | JSON quiz file import |
| **expo-file-system** | ~55.0.x | Read JSON files, write CSV |
| **expo-sharing** | ~55.0.x | Share CSV via system share sheet |
| **expo-image-picker** | ~55.0.x | Quiz banner image selection |
| **expo-font** | ~55.0.x | Manrope custom font loading |
| **Lucide React Native** | 0.575.x | Icon library |
| **Zod** | 4.3.x | Schema validation |
| **React Hook Form** | 7.72.x | Form state management |

### Backend (backend/)

| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | v18.x LTS | JavaScript runtime |
| **Express.js** | 4.18.x | Web application framework |
| **Socket.IO** | 4.7.x | Real-time WebSocket server |
| **MongoDB** | 6.0+ | NoSQL document database |
| **Mongoose** | 8.0.x | MongoDB ODM |
| **jsonwebtoken** | 9.0.x | JWT token generation & verification |
| **bcryptjs** | 3.0.x | Password hashing (saltRounds = 10) |
| **dotenv** | 16.3.x | Environment variable management |
| **cors** | 2.8.x | Cross-origin resource sharing |
| **helmet** | 7.1.x | HTTP security headers |
| **morgan** | 1.10.x | HTTP request logger |
| **joi** | 17.11.x | Server-side input validation |
| **nodemon** | 3.0.x | Auto-restart in development |

---

## ⚙️ Prerequisites

Make sure you have the following installed before running EduQuiz LAN:

```
Node.js     v18.0+ LTS     → https://nodejs.org
npm         v9+            → Comes with Node.js
MongoDB     6.0+           → https://www.mongodb.com/try/download/community
               OR MongoDB Atlas account (free tier) → https://cloud.mongodb.com
Expo CLI    latest         → npm install -g expo-cli
Git         latest         → https://git-scm.com
```

**For device testing:**
- Android phone with **Expo Go** app installed (Play Store)
- All devices must be connected to the **same Wi-Fi network**

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/EduQuiz-LAN.git
cd "EduQuiz LAN"
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

#### Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Server
PORT=5000

# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/eduquiz-lan
# OR MongoDB Atlas:
# MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/eduquiz-lan

# JWT Secret (use a long random string)
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random

# CORS Origin (your machine's LAN IP, or * for dev)
CORS_ORIGIN=*
```

> 💡 **Find your LAN IP:** Run `ipconfig` (Windows) or `ifconfig` (Mac/Linux) and look for your Wi-Fi adapter IPv4 address (e.g., `192.168.1.100`)

#### Start the Backend

```bash
# Development (auto-restart on changes)
npm run dev

# Production
npm start
```

Backend will start on: `http://localhost:3000`

You should see:
```
🚀 Server running on port 3000
✅ MongoDB Connected
```

---

### 3. Frontend (App) Setup

Open a **new terminal** window:

```bash
cd App
npm install
```

#### Configure the API URL

Edit `App/utils/api.js` and update the `BASE_URL` to point to your machine's **LAN IP address**:

```javascript
// App/utils/api.js
const BASE_URL = 'http://localhost:3000/api';
//                        ↑ Replace with YOUR machine's LAN IP
```

> ⚠️ Do **NOT** use `localhost` or `127.0.0.1` — other devices on the network won't be able to reach it. Use the actual IPv4 address of the machine running the backend.

Also update the socket URL in `App/utils/socket.js`:

```javascript
const SOCKET_URL = 'http://localhost:3000';
//                          ↑ Same LAN IP
```

---

### 4. Environment Variables

`App/.env` (already exists):
```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

---

### 5. Running the App

```bash
cd App
npx expo start
```

This opens the **Expo Dev Tools**. Then:

| Method | Command | Use Case |
|---|---|---|
| **Expo Go (Recommended)** | Scan QR code with Expo Go app | Fastest — test on real device |
| **Android Emulator** | Press `a` in terminal | Android Studio required |
| **iOS Simulator** | Press `i` in terminal | macOS + Xcode required |
| **Web Browser** | Press `w` in terminal | Limited feature testing |

> 📱 **Ensure all test devices are on the SAME Wi-Fi network as the machine running the backend.**

---

## 📱 App Screens

| Screen | File | Route | Description |
|---|---|---|---|
| Splash | `index.jsx` | `/` | Animated launch screen, auto-login check |
| Login | `login.jsx` | `/login` | Email + password auth with real-time validation |
| Register | `register.jsx` | `/register` | New account creation |
| Home | `home.jsx` | `/home` | Dashboard: Create Game / Join Game |
| Create Quiz | `create-quiz.jsx` | `/create-quiz` | Build quiz, add questions, configure game |
| Join Game | `join-game.jsx` | `/join-game` | Enter room code + nickname to join |
| Waiting Area | `waiting-area.jsx` | `/waiting-area` | Lobby for host and players before game starts |
| Question Panel | `question-panel.jsx` | `/question-panel` | Active exam screen with timer and navigation |
| Host Leaderboard | `host-live-leaderboard.jsx` | `/host-live-leaderboard` | Real-time standings during game |
| Host Answer Key | `host-answer-key.jsx` | `/host-answer-key` | View correct answers during/after game |
| Final Results | `HostFinalResultsScreen.jsx` | `/HostFinalResultsScreen` | Final standings + CSV export |
| Player Results | `player-results.jsx` | `/player-results` | Personal score + answer review |

### Navigation Flow

```
[Splash]
    ├── (has token) ──────────────► [Home]
    └── (no token) ───────────────► [Login] ──► [Register]
                                        │
                                        ▼
                                      [Home]
                                        │
                          ┌─────────────┴─────────────┐
                          ▼                            ▼
                    [Create Quiz]               [Join Game]
                          │                            │
                          ▼                            ▼
                   [Waiting Area] ◄────────── [Waiting Area]
                   (as Host)                  (as Player)
                          │                            │
                    (Start Game)               (game_started)
                          │                            │
                          ▼                            ▼
               [Host Live Leaderboard]       [Question Panel]
                          │                            │
               [Host Answer Key]              (submit_exam)
                          │                            │
                    (End Game)                         ▼
                          │                   [Player Results]
                          ▼                            │
               [Host Final Results]                    │
                          │                            │
                          └────────────┬───────────────┘
                                       ▼
                                    [Home]
```

---

## 🔌 Socket.IO Events

### Client → Server

| Event | Payload | Description |
|---|---|---|
| `join_room` | `{ name, roomCode, role, deviceId, userId }` | Join a socket room as host or player |
| `start_game` | `{ roomCode }` | Host triggers game start |
| `fetch_exam_paper` | `{ roomCode }` | Player requests their personalized exam |
| `submit_exam` | `{ roomCode, answersMap }` | Player submits final answers |
| `end_quiz_session` | `{ roomCode }` | Host ends the session |

### Server → Client

| Event | Payload | Description |
|---|---|---|
| `player_joined` | `{ name, count }` | A new player joined the room |
| `game_started` | `{ total }` | Game has started — navigate to exam |
| `start_exam` | `{ totalDuration, totalQuestions, questions[] }` | Personalized exam paper (answers stripped, MCQ shuffled) |
| `update_leaderboard` | `[{ id, name, correct, currentQ, totalQuestions, isFinished }]` | Real-time leaderboard update |
| `game_over` | `{ rank, finalScore, totalQuestions, reportCard[] }` | Session ended — personal results |
| `error_msg` | `{ message }` | Error notification |

### Answer Map Format

```javascript
// answersMap sent in submit_exam
{
  "64abc123def456": "Paris",           // questionId → selectedOption
  "64abc789ghi012": "True",
  "64abc345jkl678": "Option C text"
}
```

---

## 🗄️ Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,           // Display name
  email: String,          // Unique, lowercase
  password: String,       // bcrypt hashed
  createdAt: Date,
  updatedAt: Date
}
```

### Games Collection
```javascript
{
  _id: ObjectId,
  roomCode: String,       // Unique 6-char alphanumeric
  hostId: ObjectId,       // → Users._id
  status: String,         // "waiting" | "active" | "finished"
  settings: {
    title: String,
    category: String,
    totalDuration: Number, // in minutes
    maxPlayers: Number,
    allowLateJoin: Boolean,
    questionOrder: String, // "sequential" | "random"
    restrictToWifi: Boolean
  },
  hostSocketId: String,
  hostIp: String,
  createdAt: Date
}
```

### Questions Collection
```javascript
{
  _id: ObjectId,
  gameId: ObjectId,       // → Games._id
  questionText: String,
  type: String,           // "MCQ" | "TRUE_FALSE"
  options: [String],      // 4 options (MCQ) or ["True","False"]
  correctAnswer: String,  // Must match one of the options exactly
  difficulty: String,     // "easy" | "medium" | "hard"
  explanation: String     // Optional explanation
}
```

### Players Collection
```javascript
{
  _id: ObjectId,
  name: String,           // Display nickname
  gameId: ObjectId,       // → Games._id
  userId: ObjectId,       // → Users._id (null if guest)
  socketId: String,       // Current socket connection ID
  deviceId: String,       // IP address (for reconnect detection)
  score: Number,          // default: 0 (10 points per correct)
  answerHistory: [{
    qId: ObjectId,
    questionText: String,
    selectedOption: String,
    correctAnswer: String,
    isCorrect: Boolean,
    explanation: String
  }],
  answeredQuestions: [Number]  // Indices of completed questions
}
```

---

## 🔐 Security

| Layer | Implementation |
|---|---|
| **Password Hashing** | `bcryptjs` with `saltRounds = 10` |
| **Authentication** | JWT tokens (`jsonwebtoken`), 7-day expiry |
| **Protected Routes** | `auth.middleware.js` verifies JWT on all `/api/game/*` routes |
| **HTTP Security** | `helmet` middleware — Content-Security-Policy, X-Frame-Options, etc. |
| **CORS** | `cors` middleware with configurable origin |
| **Anti-Cheat** | MCQ options shuffled via `shuffleArray()` before delivery to players |
| **Answer Stripping** | `correctAnswer` field removed from questions before sending to clients |
| **Duplicate Prevention** | `deviceId` (IP) check prevents same device joining twice |
| **Input Validation** | Client-side real-time + server-side `joi` validation |
| **Request Logging** | `morgan` logger for audit trail |

---

## 📊 Quiz JSON Format

You can import a pre-built quiz using the "Import Dummy JSON" button in Create Quiz. The JSON file must follow this format:

```json
{
  "settings": {
    "title": "Science Quiz - Chapter 5",
    "category": "Science",
    "totalDuration": 15,
    "maxPlayers": 30,
    "allowLateJoin": false,
    "questionOrder": "Sequential",
    "restrictToWifi": true
  },
  "questions": [
    {
      "text": "What is the chemical symbol for water?",
      "format": "MCQ",
      "options": ["H2O", "CO2", "NaCl", "O2"],
      "correctAnswer": 0,
      "difficulty": "Easy"
    },
    {
      "text": "The Earth revolves around the Sun.",
      "format": "True/False",
      "options": ["True", "False"],
      "correctAnswer": 0,
      "difficulty": "Easy"
    },
    {
      "text": "Which planet is known as the Red Planet?",
      "format": "MCQ",
      "options": ["Venus", "Jupiter", "Mars", "Saturn"],
      "correctAnswer": 2,
      "difficulty": "Medium"
    }
  ]
}
```

**Field Reference:**

| Field | Type | Required | Description |
|---|---|---|---|
| `settings.title` | String | ✅ | Quiz display title |
| `settings.category` | String | ❌ | Category label |
| `settings.totalDuration` | Number | ❌ | Total time in minutes (default: 15) |
| `questions[].text` | String | ✅ | Question text |
| `questions[].format` | String | ✅ | `"MCQ"` or `"True/False"` |
| `questions[].options` | Array | ✅ | Array of option strings |
| `questions[].correctAnswer` | Number | ✅ | Index of the correct option (0-based) |
| `questions[].difficulty` | String | ❌ | `"Easy"`, `"Medium"`, or `"Hard"` |

---

## 📤 CSV Export Format

When the host exports results, a `.csv` file is generated and shared:

```csv
Rank,Player Name,Correct Answers,Wrong/Skipped,Total Score
1,Aksh Raj,9,1,90
2,Priya Sharma,8,2,80
3,Rahul Kumar,7,3,70
4,Neha Singh,6,4,60
5,Amit Verma,5,5,50
```

> Score = Correct Answers × 10 points

---

## 🧪 Testing

### Manual Test Flow (Multi-Device)

1. **Machine A** — Run backend (`npm run dev` in `backend/`)
2. **Device 1 (Host)** — Open app → Login → Create Quiz (add 5 questions) → Create Lobby → Note room code
3. **Device 2 (Player 1)** — Open app → Login → Join Game → Enter room code → Enter nickname → Join
4. **Device 3 (Player 2)** — Same as Device 2 with different nickname
5. **Device 1** — Click "Start Quiz Now"
6. **Devices 2 & 3** — Answer questions, submit
7. **Device 1** — Verify live leaderboard updates; End Game; Export CSV

### Backend API Test (Postman)

```
POST http://localhost:3000/api/auth/register
Content-Type: application/json
{
  "name": "Aksh Raj",
  "email": "aksh@test.com",
  "password": "password123"
}

POST http://localhost:3000/api/auth/login
Content-Type: application/json
{
  "email": "aksh@test.com",
  "password": "password123"
}

POST http://localhost:3000/api/game/create
Authorization: Bearer <jwt_token>
Content-Type: application/json
{
  "questions": [...],
  "settings": { "title": "Test Quiz", "totalDuration": 10 }
}

GET http://localhost:3000/api/game/info/ABC123
Authorization: Bearer <jwt_token>
```

---

## 🗺️ Roadmap

| Feature | Status | Version |
|---|---|---|
| MCQ & True/False questions | ✅ Done | v1.0 |
| Real-time LAN leaderboard | ✅ Done | v1.0 |
| JSON quiz import | ✅ Done | v1.0 |
| CSV export | ✅ Done | v1.0 |
| Late join support | ✅ Done | v1.0 |
| Image-based questions | 🔜 Planned | v2.0 |
| Per-question timers (Kahoot-style) | 🔜 Planned | v2.0 |
| QR code room join | 🔜 Planned | v2.0 |
| Session history / analytics | 🔜 Planned | v2.0 |
| Bluetooth mode (no Wi-Fi needed) | 🔜 Planned | v2.0 |
| Admin web dashboard | 🔜 Planned | v3.0 |
| Multilingual support (Hindi) | 🔜 Planned | v3.0 |
| Cloud/internet mode | 🔜 Planned | v3.0 |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/your-feature-name`
3. **Commit** your changes: `git commit -m "feat: add your feature"`
4. **Push** to the branch: `git push origin feature/your-feature-name`
5. **Open** a Pull Request

### Commit Convention

```
feat:     New feature
fix:      Bug fix
docs:     Documentation changes
style:    Code style/formatting (no logic change)
refactor: Code refactoring
test:     Adding/updating tests
chore:    Build, config, dependency changes
```

---

## 👨‍💻 Author

<div align="center">

**Aksh Raj**

BCA 3rd Year 

</div>

---

<div align="center">

**⭐ Star this repo if you found it useful!**

Made with ❤️ using React Native, Node.js & Socket.IO

</div>
