import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Automatically add token to every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Auth routes
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);

// Quiz routes
export const getQuestions = (subject) => API.get(`/quiz/${subject}`);
export const submitQuiz = (data) => API.post('/quiz/submit', data);
export const getWeakTopics = (userId) => API.get(`/quiz/weak/${userId}`);

// Roadmap routes
export const getRoadmap = (userId) => API.get(`/roadmap/${userId}`);