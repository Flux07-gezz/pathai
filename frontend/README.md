# PathAI 🤖 — Adaptive Offline Learning Companion

> **Samsung Solve for Tomorrow 2026** — AI-powered personalized education for students in low-connectivity environments across India.

---

## The Problem

Most AI tutoring tools are generic chatbots. They don't know what *you* struggle with, can't adapt to your level, and stop working the moment your internet drops. For students in Tier 2 and Tier 3 cities — where connectivity is unreliable and personalized tutoring is unaffordable — this means millions of students are left behind.

---

## Our Solution

PathAI identifies exactly where each student struggles through quiz-based performance tracking, then uses Google Gemini AI to generate a personalized 7-day study roadmap targeting those specific weak points. The app works offline after first load, supports Hindi and English, and is built for low-connectivity environments.

---

## Key Features

**AI Quiz Engine**
Generates curriculum-aligned MCQ questions on demand using the Gemini 2.5 Flash API. Questions are saved to MongoDB after first generation — future quizzes load instantly without additional API calls, minimizing quota usage.

**Smart Weakness Detection**
Tracks per-topic scores after every quiz. Topics scoring below 50% are flagged as weak and stored (max 10 active weak topics). When a student retakes a topic and scores above 70%, it is automatically promoted to a strength. Students can also manually mark topics as mastered.

**Personalized AI Roadmaps**
Students select which weak topics to include, then Gemini builds a targeted 7-day study plan with daily activities. Up to 5 active roadmaps at a time — completing one moves it to a persistent archive (last 5 kept). Related subject detection prevents overlapping roadmaps.

**Offline-First Architecture**
Core data is cached in localStorage after first load. The app remains functional with no internet connection after initial setup — critical for our target users.

**Multilingual Support**
Full English and Hindi interface toggle via React Context, covering all major UI labels and navigation.

**NCERT-Aligned Dynamic Quizzes**
Students can set their class level (Class 6–12) and generate topic-specific quizzes anchored to the Indian CBSE/NCERT curriculum.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router, Axios, Inline Styles |
| Backend | Node.js, Express.js, JWT, bcrypt |
| Database | MongoDB Atlas |
| AI | Google Gemini 2.5 Flash API |
| Deployment | Vercel (frontend), Render (backend) |

---

## Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/Flux07-gezz/pathai.git
cd pathai
```

### 2. Backend setup
```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:
```
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_google_gemini_api_key
PORT=5000
```

Run the backend:
```bash
node server.js
```

### 3. Frontend setup
Open a new terminal:
```bash
cd frontend
npm install
npm start
```

App runs at `http://localhost:3000`

---

## Project Structure

```
pathai/
├── backend/
│   ├── models/          # User, Question, QuizScore, WeakTopic, Roadmap
│   ├── routes/          # auth, quiz, weakness, roadmap
│   └── server.js
└── frontend/
    └── src/
        ├── pages/       # Dashboard, QuizPage, WeaknessReport, RoadmapPage
        ├── components/  # Navbar
        └── utils/       # api.js, storage.js
```

---

## Team

| Name | GitHub |
|---|---|
| Anshu Raj | [@Flux07-gezz](https://github.com/Flux07-gezz) |
| Anshika | [@Anshika117](https://github.com/Anshika117) |

---

## Submission

**Hackathon:** Samsung Solve for Tomorrow 2026  
**Status:** Fully functional prototype (Beta v1.0.0)  
**Theme:** Education — personalized learning for underserved students