import axios from 'axios';

// const API = axios.create({
//   baseURL: 'http://localhost:5000/api'
// });


const API = axios.create({
  // Bypasses local domain name translation blockades completely
  baseURL: 'http://127.0.0.1:5000/api'
});

// === AUTHENTICATION API EXPORTS ===
export const login = (credentials) => API.post('/auth/login', credentials);
export const register = (userData) => API.post('/auth/register', userData);

// === QUIZ ENGINE API EXPORTS ===
// Passes filters to backend matching class level and board setups
export const getQuestions = (userId, subject, topic) => 
  API.get('/quiz/generate-questions', { params: { userId, subject, topic } });

// Main score tracking submission endpoint 
export const submitQuiz = (quizResultData) => API.post('/quiz/submit', quizResultData);

// Logs individual historical questions solved by users to prevent duplicate repeats
export const logSolvedQuestions = (userId, subject, questionsData) => 
  API.post('/quiz/submit-results', { userId, subject, questionsData });

// Fetches the saved weak topics for the dashboard analytics report
export const getWeakTopics = (userId) => API.get(`/quiz/weak-topics/${userId}`); // ◄--- ADD THIS EXP0RT

// === ROADMAP ENGINE API EXPORTS ===
export const getRoadmap = (userId) => API.post('/roadmap/generate', { userId });