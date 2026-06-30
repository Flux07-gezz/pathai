import axios from 'axios';

const API = axios.create({
  // Force clean Create React App configuration syntax
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
});

// Automatically add token to every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Target routes used by your components
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const updateOnboardingClass = (data) => API.put('/auth/update-class', data);
// Quiz routes
export const getQuestions = (subject, difficulty) => API.get(`/quiz/${subject}/${difficulty}`);
export const submitQuiz = (data) => API.post('/quiz/submit', data);
export const getWeakTopics = (userId) => API.get(`/quiz/weak/${userId}`);

// Roadmap routes
export const getRoadmaps = (userId) => API.get(`/roadmap/${userId}`);
export const generateRoadmap = (data) => API.post('/roadmap/generate', data);
export const completeRoadmap = (roadmapId) => API.put(`/roadmap/complete/${roadmapId}`);

// Weakness routes
export const getWeaknessGrouped = (userId) => API.get(`/weakness/${userId}`);
export const getStrengths = (userId) => API.get(`/weakness/strengths/${userId}`);
export const markAsStrength = (topicId) => API.put(`/weakness/mark-strength/${topicId}`);

export default API;
