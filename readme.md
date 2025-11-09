# <DevCompete/> ⚔️

> **Challenge developers worldwide. Compete in real-time coding battles and prove your skills.**

A next-generation real-time competitive coding platform where developers battle each other live, solve Data Structures & Algorithms (DSA) problems, earn ratings, and climb the global leaderboard through **gamified learning**.

---

## 🎯 Problem Statement

Traditional coding practice platforms are **solo experiences** with no motivation beyond personal improvement. Developers face:

- ❌ **Lack of engagement** - Solo problem-solving feels monotonous
- ❌ **No competitive edge** - No real-time comparison with peers
- ❌ **Demotivating progress** - No clear milestones or achievements
- ❌ **Social isolation** - No community-driven learning
- ❌ **Inconsistent feedback** - Delayed or no immediate results

**DevCompete solves this** by combining:
- ⚡ **Real-time 1v1 battles** - Live coding duels with synchronized timing
- 🏆 **Gamified progression** - Rating tiers, leaderboards, and achievements
- 💡 **Instant feedback** - Immediate code execution and results
- 🤝 **Competitive learning** - Learn faster by competing with peers
- 📊 **Progress tracking** - Detailed match history and statistics

---

## 🎮 Our Approach: Gamified Learning

We believe **competitive gamification transforms learning into fun**. DevCompete implements:

### 1. **Real-Time Battles** ⚡
- Live 1v1 coding duels with synchronized server timing
- Both players race against the clock simultaneously
- Real-time progress tracking shows who's solving problems first
- Instant execution feedback keeps energy high

### 2. **Rating & Progression System** 📈
```
Tier System (Elo-based):
🥉 Bronze       → 0-999      (Rookie)
⚪ Silver       → 1000-1599  (Intermediate)
🟡 Gold         → 1600-1999  (Advanced)
💎 Platinum     → 2000-2399  (Professional)
🔷 Diamond      → 2400-2999  (Expert)
👑 Conqueror    → 3000-3499  (Master)
✨ Arceus       → 3500+      (Legend)
```

### 3. **Reward Structure** 🏅
- **Win Streak Bonuses** - Extra points for consecutive wins
- **Match History** - Track performance over time
- **Skill-Based Matching** - Face opponents of similar skill
- **Achievement Badges** - Unlock badges for milestones

### 4. **Social Competition** 🌍
- Global leaderboard showing top competitors
- Public match history visible to community
- Profile showcase with stats and achievements
- Real-time notifications of opponent progress

### 5. **Instant Gratification** ✨
- Code executes immediately with visual feedback
- See results in milliseconds, not hours
- Real-time opponent progress updates
- Instant tier promotions on achievements

---

## 📋 Table of Contents

- [Problem Statement](#-problem-statement)
- [Our Approach: Gamified Learning](#-our-approach-gamified-learning)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Architecture](#-project-architecture)
- [Installation & Setup](#-installation--setup)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [How It Works](#-how-it-works)
- [API Documentation](#-api-documentation)
- [Socket Events](#-socket-events)
- [Database Schema](#-database-schema)
- [Key Components](#-key-components)
- [Real-Time Features](#-real-time-features)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🎮 Core Battle Features
- **Live 1v1 Coding Duels** - Real-time matches with synchronized timing
- **5-Problem Challenges** - Each battle features 5 different DSA problems
- **Instant Code Execution** - Run code against test cases immediately
- **Real-time Progress Sync** - See opponent's progress as it happens
- **Match History & Replays** - View detailed stats from past battles
- **Auto-Match Timing** - Server-synchronized clocks (no client-side cheating)

### 👥 Competitive Elements
- **Global Leaderboard** - Rank against developers worldwide
- **Elo-Based Rating System** - Skill-based tier progression
- **Win/Loss Tracking** - Comprehensive match statistics
- **Performance Analytics** - Detailed battle breakdowns
- **Ranked Multiplayer** - Fair matchmaking based on skill

### 💻 Problem Solving
- **2800+ LeetCode Problems** - Extensive problem library
- **Multiple Difficulty Levels** - Easy, Medium, Hard
- **Instant Test Feedback** - See which tests pass/fail
- **Code Execution Engine** - Judge0 integration
- **All Popular Languages** - C++, Java, Python, JavaScript

### 👤 User Management & Profiles
- **Auth0 OAuth Integration** - Seamless social login
- **Customizable Profiles** - Avatar upload via Cloudinary
- **User Badges & Achievements** - Unlock special badges
- **Public Profile Stats** - Showcase your expertise
- **Rating History** - Track rating progression over time

---

## 🏗️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 19.1.1** | UI Framework |
| **Vite 7.1.7** | Build Tool & Dev Server |
| **React Router 7.9.3** | Client-side Routing |
| **Socket.IO Client 4.8.1** | Real-time Communication |
| **Monaco Editor** | Code Editor |
| **Tailwind CSS 4.1.14** | Styling |
| **Auth0 React SDK** | Authentication |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Node.js & Express 5.1.0** | API Server |
| **Socket.IO 4.8.1** | WebSocket Server |
| **MongoDB & Mongoose** | Database |
| **JWT** | Token Authentication |
| **Bcryptjs** | Password Hashing |
| **Judge0 API** | Code Execution |
| **Cloudinary** | Image Hosting |

---

## 🏗️ Project Architecture

```
leetcompete/
│
├── 📁 leetcompete-client/          # React Frontend (Port 5173)
│   ├── src/
│   │   ├── components/
│   │   │   ├── home/               # Landing page sections
│   │   │   │   ├── HeroSection.jsx
│   │   │   │   ├── FeaturesSection.jsx
│   │   │   │   ├── HowItWorksSection.jsx
│   │   │   │   └── CTASection.jsx
│   │   │   ├── problemPanel/       # Coding battle interface
│   │   │   │   ├── ProblemScreen.jsx      (Main battle view)
│   │   │   │   ├── LeftPanel.jsx          (Problem description)
│   │   │   │   ├── rightPanel.jsx         (Code editor)
│   │   │   │   ├── OutputPanel.jsx        (Results display)
│   │   │   │   ├── problemNavbar.jsx      (Timer & progress)
│   │   │   │   ├── BattleProgress.jsx     (Live stats)
│   │   │   │   └── editorUtils.js         (Code utilities)
│   │   │   ├── profile/
│   │   │   │   ├── Profile.jsx
│   │   │   │   └── EditProfile.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── RatingTiers.jsx
│   │   │   ├── ChatBot.jsx
│   │   │   ├── PageLoader.jsx
│   │   │   └── Auth0Callback.jsx
│   │   ├── pages/                  # Route pages
│   │   │   ├── Home.jsx            (Landing)
│   │   │   ├── LeaderBoard.jsx     (Rankings)
│   │   │   ├── History.jsx         (Match history)
│   │   │   ├── SelectProblem.jsx   (Problem selection)
│   │   │   ├── JoinRoom.jsx        (Join battle)
│   │   │   ├── WaitingWindow.jsx   (Match lobby)
│   │   │   ├── Login.jsx           (Auth)
│   │   │   ├── Signup.jsx          (Registration)
│   │   │   ├── PrivacyPolicy.jsx
│   │   │   ├── TermsOfService.jsx
│   │   │   └── NotFound.jsx
│   │   ├── context/
│   │   │   ├── BattleContext.jsx   (Match state)
│   │   │   └── UserContext.jsx     (User state)
│   │   ├── hooks/
│   │   │   ├── getCurrentUser.js
│   │   │   └── ProtectedRoutes.jsx
│   │   ├── socket.js               (Socket.IO setup)
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── package.json
│
└── 📁 leetcompete-server/          # Express Backend (Port 8080)
    ├── config/
    │   ├── connectDB.js            (MongoDB connection)
    │   ├── cloudinaryConfig.js     (Image upload)
    │   └── token.js                (JWT utilities)
    ├── controller/
    │   ├── authController.js       (Auth endpoints)
    │   ├── userController.js       (User endpoints)
    │   ├── problemController.js    (Problem endpoints)
    │   ├── roomController.js       (Room management)
    │   ├── evaluationController.js (Code execution)
    │   └── submissionController.js (Submission tracking)
    ├── model/
    │   ├── userModel.js            (User schema)
    │   ├── problemModel.js         (Problem schema)
    │   ├── roomModel.js            (Battle room schema)
    │   ├── matchModel.js           (Match schema)
    │   ├── matchParticipantModel.js (Participant schema)
    │   └── submissionModel.js      (Submission schema)
    ├── routes/
    │   ├── authRoute.js
    │   ├── userRoute.js
    │   ├── problemRoute.js
    │   ├── roomRoute.js
    │   ├── evaluationRoute.js
    │   └── submissionRoute.js
    ├── sockets/
    │   └── socketServer.js         (WebSocket handlers)
    ├── middlewares/
    │   └── isAuth.js               (JWT verification)
    ├── services/
    │   └── geminiService.js        (AI features)
    ├── data/
    │   └── problems_cleaned.json   (2800+ problems)
    ├── scripts/
    │   └── importProblems.js       (DB seeding)
    ├── server.js                   (Entry point)
    └── package.json
```

---

## 🎯 How It Works

### Step 1️⃣ - Create or Join a Room
- Host creates a private battle room
- Generates unique room code
- Invites opponent by sharing the code
- Opponent joins using the code

### Step 2️⃣ - Select Problems & Start Battle
- Choose 5 problems from the library
- Host starts the match
- Server broadcasts synchronized **startTime**
- Both players see identical countdown

### Step 3️⃣ - Solve DSA Problems
- Race against opponent and the clock
- Submit solutions to test cases
- See real-time progress of both players
- Solve more problems to gain advantage

### Step 4️⃣ - Battle Ends & Results
- Match ends when time runs out OR all problems solved
- Winner determined by: **problems solved** → **time taken**
- Ratings updated based on performance
- Match saved to history with detailed stats

### Step 5️⃣ - View History & Rankings
- Access match history anytime
- See opponent info, problems solved, duration
- Check global leaderboard
- Track rating progression

---

## 📥 Installation & Setup

### Prerequisites
- **Node.js v16+** and **npm**
- **MongoDB** (local or MongoDB Atlas)
- **Git**
- **Auth0 account** (for OAuth)
- **Cloudinary account** (for image uploads)
- **Judge0 API key** (for code execution)

### Step 1: Clone Repository

```bash
git clone https://github.com/YM-Solutions-Official/leetcompete.git
cd leetcompete
```

### Step 2: Frontend Setup

```bash
cd leetcompete-client
npm install
```

### Step 3: Backend Setup

```bash
cd ../leetcompete-server
npm install
```

### Step 4: Seed Database

```bash
# From leetcompete-server directory
node scripts/importProblems.js
```

---

## ⚙️ Configuration

### Frontend Environment Variables (`.env`)

Create a `.env` file in `leetcompete-client/`:

```env
VITE_AUTH0_DOMAIN=your_auth0_domain.auth0.com
VITE_AUTH0_CLIENT_ID=your_auth0_client_id
VITE_AUTH0_REDIRECT_URI=http://localhost:5173/callback
VITE_SERVER_URL=http://localhost:8080
```

### Backend Environment Variables (`.env`)

Create a `.env` file in `leetcompete-server/`:

```env
# Server
PORT=8080
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb://localhost:27017/leetcompete
# OR MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/leetcompete

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Auth0 Configuration
AUTH0_DOMAIN=your_auth0_domain.auth0.com
AUTH0_CLIENT_ID=your_auth0_client_id
AUTH0_CLIENT_SECRET=your_auth0_client_secret

# Cloudinary (Image Upload)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Judge0 API (Code Execution)
JUDGE0_API_KEY=your_judge0_api_key
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com

# Google Gemini (AI Chatbot)
GEMINI_API_KEY=your_gemini_api_key
```

---

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Start Frontend:**
```bash
cd leetcompete-client
npm run dev
# Frontend: http://localhost:5173
```

**Terminal 2 - Start Backend:**
```bash
cd leetcompete-server
npm run dev
# Backend API: http://localhost:8080
```

### Production Build

**Frontend:**
```bash
cd leetcompete-client
npm run build
npm run preview
```

**Backend:**
```bash
cd leetcompete-server
# Set NODE_ENV=production in .env
npm start
```

---

## 📡 API Documentation

### Authentication Endpoints

#### `POST /api/auth/register`
Register a new user account
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Developer"
}
```

#### `POST /api/auth/login`
Login with email and password
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

#### `POST /api/auth/logout`
Logout current user *(Protected)*

### User Endpoints

#### `GET /api/user/getcurrentuser` *(Protected)*
Get logged-in user's profile information

#### `POST /api/user/updateName` *(Protected)*
Update user's display name
```json
{ "name": "New Name" }
```

#### `POST /api/user/updateDescription` *(Protected)*
Update user's bio/description
```json
{ "description": "Competitive Coder | DSA Enthusiast" }
```

#### `POST /api/user/updatePhotoURL` *(Protected)*
Upload profile avatar (Multipart form data)

#### `GET /api/user/getleaderboard`
Get global leaderboard with top 100 users and their ratings

#### `GET /api/user/getmatchhistory` *(Protected)*
Get user's match history with detailed statistics

### Problem Endpoints

#### `GET /api/problems`
Get all problems with optional filtering
```
Query: ?difficulty=Easy&tags=array&limit=10
```

#### `GET /api/problems/:id`
Get specific problem by ID with test cases

#### `POST /api/problems/search`
Search problems by title or description

### Room Endpoints

#### `POST /api/rooms/create` *(Protected)*
Create a new battle room
```json
{
  "selectedProblems": ["id1", "id2", "id3", "id4", "id5"],
  "duration": 30
}
```

#### `POST /api/rooms/join` *(Protected)*
Join an existing battle room
```json
{ "roomId": "room_code_123" }
```

#### `GET /api/rooms/:roomId`
Get room details and participants

#### `POST /api/rooms/cancel` *(Protected)*
Cancel/Leave a room

### Code Evaluation Endpoints

#### `POST /api/evaluate/run`
Execute code against a single test case (practice)
```json
{
  "problemId": "problem_id_123",
  "code": "class Solution { ... }"
}
```
**Response:**
```json
{
  "mode": "run",
  "passed": true,
  "output": "result_output",
  "expectedOutput": "expected_result",
  "status": "Accepted"
}
```

#### `POST /api/evaluate/submit` *(Protected)*
Submit code against all test cases
```json
{
  "problemId": "problem_id_123",
  "code": "class Solution { ... }"
}
```
**Response:**
```json
{
  "mode": "submit",
  "totalTests": 5,
  "passedTests": 5,
  "allPassed": true,
  "results": [
    {
      "testCase": 1,
      "passed": true,
      "input": {...},
      "expectedOutput": "...",
      "output": "..."
    }
  ]
}
```

---

## 🔌 WebSocket Events

### Client → Server Events

#### `join-room`
Join a battle room
```javascript
socket.emit('join-room', {
  roomId: 'room_123',
  userId: 'user_456',
  name: 'John Developer',
  photoURL: 'https://...'
});
```

#### `start-match`
Host starts the battle (server broadcasts synchronized time)
```javascript
socket.emit('start-match', {
  roomId: 'room_123',
  metadata: {
    duration: 30,
    problems: ['id1', 'id2', 'id3', 'id4', 'id5']
  }
});
```

#### `code-submitted`
Submit code solution (saves to DB, broadcasts to opponent)
```javascript
socket.emit('code-submitted', {
  roomId: 'room_123',
  userId: 'user_456',
  problemId: 'problem_789',
  result: {
    code: 'solution code',
    allPassed: true,
    attempts: 2
  }
});
```

#### `my-submission`
Track own submission for progress update
```javascript
socket.emit('my-submission', {
  roomId: 'room_123',
  userId: 'user_456',
  problemId: 'problem_789',
  result: { allPassed: true }
});
```

#### `sync-code`
Real-time code synchronization
```javascript
socket.emit('sync-code', {
  roomId: 'room_123',
  problemId: 'problem_789',
  code: 'updated code here'
});
```

#### `change-problem`
Switch to different problem
```javascript
socket.emit('change-problem', {
  roomId: 'room_123',
  problemIndex: 2
});
```

### Server → Client Events

#### `opponent-joined`
Opponent has joined the room
```javascript
{ userId, name, photoURL }
```

#### `match-started`
Match has started (includes server timestamp for sync)
```javascript
{ startTime: 1699525800000, metadata: {...} }
```

#### `opponent-submitted`
Opponent submitted a solution
```javascript
{ userId, problemId, result: {...} }
```

#### `opponent-changed-problem`
Opponent switched to different problem
```javascript
{ problemIndex, userId }
```

#### `opponent-disconnected`
Opponent has disconnected
```javascript
{ userId }
```

---

## 💾 Database Schema

### User Schema
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed with bcryptjs),
  name: String,
  photoURL: String (Cloudinary URL),
  description: String (bio),
  rating: Number (default: 1000),
  matchesPlayed: Number (default: 0),
  matchesWon: Number (default: 0),
  totalScore: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

### Problem Schema
```javascript
{
  _id: ObjectId,
  problemNumber: Number,
  title: String,
  slug: String (unique),
  difficulty: String (Easy|Medium|Hard),
  content: String (HTML problem statement),
  testCases: [{
    input: Mixed (any type),
    expectedOutput: Mixed (any type)
  }],
  topicTags: [String],
  metaData: {
    name: String (function name to call),
    params: [{
      name: String,
      type: String
    }],
    return: { type: String }
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Room Schema
```javascript
{
  _id: ObjectId,
  roomId: String (unique, human-readable code),
  hostId: ObjectId (ref: User),
  selectedProblems: [ObjectId],
  duration: Number (minutes),
  status: String (waiting|in-progress|completed|cancelled),
  matchId: ObjectId (ref: Match),
  createdAt: Date,
  updatedAt: Date
}
```

### Match Schema
```javascript
{
  _id: ObjectId,
  roomId: ObjectId (ref: Room),
  participants: [ObjectId],
  problems: [ObjectId],
  status: String (pending|in-progress|completed),
  startedAt: Date,
  endedAt: Date,
  winnerId: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### MatchParticipant Schema
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  matchId: ObjectId (ref: Match),
  problems: [{
    problemId: ObjectId,
    status: String (not_attempted|attempted|solved),
    attempts: Number,
    lastSubmissionTime: Date,
    bestScore: Number (0-100)
  }],
  totalScore: Number,
  totalTime: Number (milliseconds),
  status: String (joined|ready|active|completed),
  rank: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Submission Schema
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  problemId: ObjectId (ref: Problem),
  matchId: ObjectId (ref: Match),
  code: String,
  language: String (cpp|javascript|python3|java),
  status: String (accepted|rejected|error),
  results: Object (complete Judge0 response),
  submittedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🎨 Key Components

### BattleContext.jsx
Global state management for match data:
```javascript
{
  roomId,           // Current room ID
  matchId,          // Current match ID
  problems,         // Array of 5 selected problems
  currentProblemIndex,  // Currently viewing problem
  opponent,         // Opponent user data
  host,             // Host user data
  duration,         // Match duration in minutes
  startTime,        // Server-synchronized start timestamp
  metadata,         // Match metadata
  isHost,           // Is current user the host
  opponentJoined    // Has opponent joined
}
```

### UserContext.jsx
Global user authentication state:
```javascript
{
  userData,         // Current user profile
  isAuthenticated,  // Is user logged in
  userRating,       // Current Elo rating
  userTier,         // Current tier (Bronze-Arceus)
  matchStats        // Win/loss/total matches
}
```

### ProblemScreen.jsx
Main battle interface combining:
- **LeftPanel** - Problem description & constraints
- **rightPanel** - Code editor with syntax highlighting
- **OutputPanel** - Test execution results
- **problemNavbar** - Match timer & progress

### editorUtils.js
Utility functions for code evaluation:
```javascript
formatOutput(val)     // Normalize output for comparison
compareOutputs(a, b)  // Smart output matching
runCode(...)          // Execute single test
submitCode(...)       // Execute all tests
```

---

## ⚡ Real-Time Architecture

### Socket.IO Event Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User A joins room → emit 'join-room'                     │
├─────────────────────────────────────────────────────────────┤
│ 2. Server saves socket data, joins Socket.IO room           │
├─────────────────────────────────────────────────────────────┤
│ 3. Server broadcasts → 'opponent-joined' to User B          │
├─────────────────────────────────────────────────────────────┤
│ 4. Host starts match → emit 'start-match'                   │
├─────────────────────────────────────────────────────────────┤
│ 5. Server broadcasts → 'match-started' with startTime       │
├─────────────────────────────────────────────────────────────┤
│ 6. Both players sync timer using server startTime           │
├─────────────────────────────────────────────────────────────┤
│ 7. User submits code → emit 'code-submitted'                │
├─────────────────────────────────────────────────────────────┤
│ 8. Server saves submission to DB & broadcasts               │
├─────────────────────────────────────────────────────────────┤
│ 9. Opponent receives → 'opponent-submitted' event           │
├─────────────────────────────────────────────────────────────┤
│ 10. Both players' progress updates in real-time             │
└─────────────────────────────────────────────────────────────┘
```

### Code Execution Flow

```
User submits code
    ↓
Frontend calls /api/evaluate/submit
    ↓
Backend extracts function name from problem metadata
    ↓
Code wrapped with print helpers for all return types
    ↓
Judge0 API executes against test cases
    ↓
Output parsed and compared with expected results
    ↓
Result sent back with pass/fail for each test
    ↓
Socket event emitted to broadcast to opponent
    ↓
Submission saved to MongoDB with detailed results
    ↓
MatchParticipant updated with progress
```

---

## 🎯 Features

### 🎮 Core Gaming Features
- **Live Battles**: Real-time 1v1 competitive coding matches
- **Problem Sets**: 2800+ LeetCode-style coding problems with test cases
- **Code Execution**: Run code against test cases with immediate feedback
- **Progress Tracking**: Real-time display of both players' progress during matches
- **Multiple Rounds**: Select 5 different problems per match
- **Match History**: Complete history of all previous battles with detailed stats

### 👥 Competitive Elements
- **Global Leaderboard**: Rank against developers worldwide
- **Elo-Based Rating**: Skill-based tier progression from Bronze to Arceus
- **Win/Loss Tracking**: Comprehensive battle statistics
- **Performance Analytics**: Detailed breakdowns of each match
- **Tier Progression**: Visual tier badges with rating milestones

### 👤 User Management
- **Auth0 OAuth**: Seamless social login
- **Customizable Profiles**: Avatar upload via Cloudinary
- **User Badges**: Unlock special achievement badges
- **Public Profile Stats**: Showcase your expertise
- **Rating History**: Track rating progression over time

### ⚙️ Code Evaluation
- **Judge0 Integration**: Code execution against multiple test cases
- **Dynamic Function Support**: Auto-detection of solution methods
- **Multiple Output Types**: Support for integers, arrays, strings, complex objects
- **Smart Output Comparison**: Flexible matching for various data types
- **Instant Feedback**: See results in milliseconds

---

## 🔒 Security Considerations

✅ **Password Hashing** - bcryptjs with salt rounds
✅ **JWT Authentication** - Secure token-based authentication
✅ **CORS Configuration** - Restricted to localhost in development
✅ **Input Validation** - Validation on all endpoints
✅ **Environment Variables** - Sensitive data in .env files
✅ **MongoDB Injection Prevention** - Using Mongoose ORM
⚠️ **Rate Limiting** - Consider adding for production

---

## 🚨 Troubleshooting

### Frontend Connection Issues
```
Problem: Cannot connect to backend
Solution:
1. Check if backend running on port 8080
2. Verify VITE_SERVER_URL in .env
3. Check CORS config in server.js
4. Clear browser cache and restart
```

### Code Execution Errors
```
Problem: Judge0 API returns errors
Solution:
1. Verify JUDGE0_API_KEY in .env
2. Check problem has correct metadata
3. Test with simpler code first
4. Check API rate limits
```

### Database Connection Issues
```
Problem: Cannot connect to MongoDB
Solution:
1. Check MONGO_URI in .env
2. Ensure MongoDB service is running
3. Verify connection string syntax
4. Check database user permissions
```

### Authentication Issues
```
Problem: Auth0 redirect not working
Solution:
1. Verify Auth0 domain & client ID
2. Check callback URL in Auth0 dashboard
3. Clear localStorage: localStorage.clear()
4. Check console for Auth0 errors
```

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** changes: `git commit -m 'Add amazing feature'`
4. **Push** to branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

Please ensure:
- Code follows project style
- Tests pass locally
- Documentation is updated
- No console errors

---

## 📝 Tech Stack Details

### Why These Technologies?

| Tech | Why |
|-----|-----|
| **React 19** | Latest React with hooks & Suspense |
| **Vite** | Ultra-fast build tool, instant HMR |
| **Socket.IO** | Real-time bidirectional communication |
| **MongoDB** | Flexible document database for user data |
| **Judge0** | Reliable code execution engine |
| **Auth0** | Enterprise-grade authentication |
| **Tailwind CSS** | Rapid UI development with utility classes |

---

## 🎮 Gaming Mechanics

### Elo Rating System
```
Win against higher rated = +16 points
Win against lower rated = +8 points
Loss against higher rated = -2 points
Loss against lower rated = -8 points
```

### Tier Promotion
```
Bronze (0-999)         → 1 rank
Silver (1000-1599)     → 2 ranks
Gold (1600-1999)       → 3 ranks
Platinum (2000-2399)   → 4 ranks
Diamond (2400-2999)    → 5 ranks
Conqueror (3000-3499)  → 6 ranks
Arceus (3500+)         → 7 ranks (Legend)
```

### Match Scoring
```
Base Score: 3 points per problem solved
Win Bonus: +5 points
Speed Bonus: +2 points (under 50% time used)
Perfect Score: +10 points (all 5 solved)
```

---

## 📈 Performance Optimization

- ✅ Code splitting with React.lazy()
- ✅ Image optimization via Cloudinary
- ✅ Database indexing on frequent queries
- ✅ Socket rooms to limit broadcast scope
- ✅ Debounced code sync events
- ✅ Lazy component loading
- ✅ CSS optimization with Tailwind

---

## 🔮 Future Roadmap

- [ ] Multiple programming languages (Python, Java, Go, Rust)
- [ ] Team battles (3+ players)
- [ ] Practice mode with AI hints
- [ ] Live streaming integration
- [ ] Tournament system with seasons
- [ ] Mobile app (React Native)
- [ ] Difficulty-based matchmaking
- [ ] Replay/video feature for matches
- [ ] Custom problem creation
- [ ] Code review system
- [ ] Collaborative problem solving

- [ ] Replay/video feature for matches
- [ ] Custom problem creation
- [ ] Code review system
- [ ] Collaborative problem solving

---

## 👥 Team Members

### 🎯 Project Leadership
Our dedicated team is committed to revolutionizing competitive coding education through gamified learning.

| Role | Member | GitHub | Email |
|------|--------|--------|-------|
| **Founder & Lead Developer** | Utkarsh Bhandari | [@utkarsh-bhandari](https://github.com/utkarsh-bhandari) | utkarsh@devcompete.com |
| **Technical Architect** | [Team Member Name] | [@username](https://github.com/) | member@devcompete.com |
| **Full Stack Developer** | [Team Member Name] | [@username](https://github.com/) | member@devcompete.com |
| **UI/UX Designer** | [Team Member Name] | [@username](https://github.com/) | member@devcompete.com |

### 👨‍💻 Core Development Team

#### **Backend Development**
- Database Architecture & MongoDB Design
- Socket.IO Real-time Communication
- Judge0 Integration & Code Execution
- JWT Authentication & Security

#### **Frontend Development**
- React Component Architecture
- Real-time UI Updates with Socket.IO
- Monaco Editor Integration
- Responsive Design with Tailwind CSS

#### **DevOps & Infrastructure**
- MongoDB Setup & Optimization
- Docker Containerization
- CI/CD Pipeline
- Performance Monitoring

### 🎨 Design & UX
- **Product Design**: Landing page, user flows, visual identity
- **UI Design**: Components, design system, animations
- **User Research**: User feedback, usability testing

### 📚 Documentation & Support
- **Technical Documentation**: API docs, setup guides
- **User Documentation**: Feature guides, FAQs
- **Community Support**: Discord, GitHub issues

---

## 🤝 How to Contribute

We welcome contributions from the community! Here's how you can help:

### 1️⃣ **Report Issues**
Found a bug? Please report it on [GitHub Issues](https://github.com/YM-Solutions-Official/leetcompete/issues)

### 2️⃣ **Feature Requests**
Have a great idea? Submit a [feature request](https://github.com/YM-Solutions-Official/leetcompete/discussions)

### 3️⃣ **Code Contributions**

```bash
# Fork the repository
git clone https://github.com/YOUR-USERNAME/leetcompete.git
cd leetcompete

# Create a feature branch
git checkout -b feature/your-feature-name

# Make your changes and commit
git commit -m "feat: add your feature"

# Push to your fork
git push origin feature/your-feature-name

# Open a Pull Request
```

### 4️⃣ **Documentation**
Help us improve documentation by:
- Adding examples
- Fixing typos
- Creating guides
- Writing tutorials

### 5️⃣ **Spread the Word**
- ⭐ Star the repository
- � Share on social media
- 🗣️ Refer friends to DevCompete

---

## 📋 Contributor Guidelines

### Code Standards
- Follow existing code style
- Write meaningful commit messages
- Add comments for complex logic
- Test your changes locally

### Commit Message Format
```
type: subject

body (optional)

footer (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code formatting
- `refactor`: Code restructuring
- `perf`: Performance improvement
- `test`: Test additions

### Pull Request Process
1. Update documentation if needed
2. Add tests for new features
3. Ensure all tests pass
4. Keep commits clean and organized
5. Link related issues

### Code Review
All PRs require:
- ✅ Code quality check
- ✅ Functionality verification
- ✅ Documentation review
- ✅ Performance assessment

---

## 🎓 Development Setup for Contributors

### Environment Setup
```bash
# Install Node.js v16+
# Install MongoDB locally or use MongoDB Atlas

# Clone and setup
git clone https://github.com/YM-Solutions-Official/leetcompete.git
cd leetcompete

# Install dependencies
cd leetcompete-client && npm install
cd ../leetcompete-server && npm install

# Configure environment variables
# Copy .env.example to .env in both directories
# Fill in your credentials

# Seed database
node scripts/importProblems.js

# Start development servers
# Terminal 1: cd leetcompete-client && npm run dev
# Terminal 2: cd leetcompete-server && npm run dev
```

### Development Tools
- **Code Editor**: VS Code recommended
- **Extensions**: 
  - ES7+ React/Redux/React-Native snippets
  - Tailwind CSS IntelliSense
  - Prettier - Code formatter
  - Thunder Client / REST Client
- **Testing**: Jest (frontend), Mocha (backend)
- **Version Control**: Git & GitHub

---

## 📊 Project Statistics

```
Language Distribution:
- JavaScript/JSX: 65%
- CSS/Tailwind: 20%
- HTML: 5%
- JSON/Config: 10%

File Distribution:
- Frontend Components: 45%
- Backend Routes/Controllers: 35%
- Configuration: 15%
- Tests/Docs: 5%
```

---

## 🏢 Organization

**GitHub Organization**: [@YM-Solutions-Official](https://github.com/YM-Solutions-Official)

### Related Projects
- [DevCompete Mobile](https://github.com/YM-Solutions-Official/devcompete-mobile) - React Native mobile app
- [DevCompete API](https://github.com/YM-Solutions-Official/devcompete-api) - REST API documentation
- [DevCompete CLI](https://github.com/YM-Solutions-Official/devcompete-cli) - Command-line tools

---

## 💼 Career Opportunities

Interested in joining the DevCompete team?

### Open Positions
- **Senior Full Stack Developer**
- **Frontend Engineer (React)**
- **Backend Engineer (Node.js)**
- **DevOps Engineer**
- **Product Manager**
- **UI/UX Designer**

For opportunities, email: **careers@devcompete.com**

---

## 🌍 Community Links

- **Website**: [devcompete.com](https://devcompete.com)
- **Discord**: [Join our server](https://discord.gg/devcompete)
- **Twitter**: [@DevCompete](https://twitter.com/devcompete)
- **LinkedIn**: [DevCompete](https://linkedin.com/company/devcompete)
- **Email**: [hello@devcompete.com](mailto:hello@devcompete.com)

---

## �📞 Support

For issues, questions, or suggestions:
- 📧 Email: support@devcompete.com
- 🐛 GitHub Issues: [Report a bug](https://github.com/YM-Solutions-Official/leetcompete/issues)
- 💬 Discord: [Join community](https://discord.gg/devcompete)
- 💡 Discussions: [Share ideas](https://github.com/YM-Solutions-Official/leetcompete/discussions)

---

## 📄 License

This project is licensed under the **ISC License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Judge0** - Code execution engine
- **Auth0** - Authentication service
- **Cloudinary** - Image hosting
- **Google Gemini** - AI capabilities
- **MongoDB** - Database
- **Socket.IO** - Real-time communication
- **React** - Frontend framework
- **Express** - Backend framework
- **Our Community** - For feedback and support

---

## 🏆 Contributors & Acknowledgments

We'd like to thank all contributors who have helped make DevCompete better:

<div align="center">

### **Platinum Contributors** 🌟
- Utkarsh Bhandari - Project Lead & Full Stack Developer

### **Gold Contributors** ⭐
- [Contributor Name] - Feature: Real-time Progress Tracking
- [Contributor Name] - Feature: Rating System

### **Silver Contributors** 💫
- [Contributor Names] - Bug fixes & improvements
- [Contributor Names] - Documentation

</div>

---

<div align="center">

### **<DevCompete/>** ⚔️
### Challenge developers worldwide

**[Create Room](https://devcompete.com/battle) | [View Leaderboard](https://devcompete.com/leaderboard) | [Join Community](https://discord.gg/devcompete) | [Contribute](https://github.com/YM-Solutions-Official/leetcompete)**

---

**Built with ❤️ by the DevCompete Team**

*Making competitive coding fun, engaging, and accessible to developers worldwide*

© 2025 DevCompete. All rights reserved.

[⬆ Back to top](#-devcompete)

</div>

</div>
