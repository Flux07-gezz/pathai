# PathAI 🤖 | Adaptive AI Learning Platform

PathAI is an intelligent, dynamic educational ecosystem built for the **Samsung Solve for Tomorrow 2026** hackathon. The platform targets the standard NCERT curriculum, tracking student execution metrics to identify learning gaps and programmatically synthesizing custom 7-day micro-study itineraries.

---

## 🚀 Key Architectural Features

* **AI Quiz Workspace (`/quiz`):** Generates curriculum-aligned practice modules on-the-fly using the `gemini-2.0-flash` engine. Keeps an active log of recently solved modules for performance evaluation.
* **Automated Weakness Analysis (`/weakness`):** Constantly screens historic exam metrics to isolate complex sub-topics where accuracy drops below **70%**.
* **Persistent AI Learning Roadmaps (`/roadmap`):** Pulls identified problem zones straight from MongoDB to compile a structural 7-day study calendar. Milestones are fully checkable and locked to the user profile, remaining persistent across sessions.
* **Dynamic Settings Framework (`/settings`):** Allows seamless configuration of academic target classes (**Class 6 to 12**). Modifying this instantly recalibrates the upstream AI prompt context windows for all modules.

---

## 🛠️ The Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend UI** | React.js (v18), React Router Dom, Axios, Inline Component Styling |
| **Backend Engine** | Node.js, Express.js, JSON Web Tokens (JWT), Mongoose |
| **Database Layer** | MongoDB Atlas Cluster Storage |
| **AI Processing** | Google Gemini API (`gemini-2.0-flash`) |

---

## 📦 Local Installation & Deployment

Follow these steps to spin up the development environment locally:

### 1. Clone the Workspace
```bash
git clone [https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git)
cd PathAI

### 2. Configure Backend Server Environment
Navigate to your backend directory and create a `.env` file:
```bash
cd backend

Create a .env file with the following variables:

Code snippet
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_encryption_token_key
GEMINI_API_KEY=your_google_gemini_api_key
Install dependencies and run the server terminal:

Bash
npm install
node server.js

### 3. Initialize the React Frontend
Open a separate terminal window at the root project workspace folder:

Bash
cd frontend
npm install
npm start
Your application container canvas will load instantly at http://localhost:3000!

🎯 Submission Context
Project Track: Samsung Solve for Tomorrow 2026

Status: Fully Functional Core Loop Prototype (Beta Ver 1.0.0)
