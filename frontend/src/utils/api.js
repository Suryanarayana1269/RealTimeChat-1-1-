import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api'; // Adjust if needed

export const signup = (userData) => axios.post(`${API_BASE}/auth/signup`, userData);

export const login = (credentials) => axios.post(`${API_BASE}/auth/login`, credentials);

export const fetchUsers = (token) =>
  axios.get(`${API_BASE}/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const fetchMessages = (receiverId, token) =>
  axios.get(`${API_BASE}/messages/${receiverId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

// Optional: post message via REST (if needed alongside socket)
export const postMessage = (messageData, token) =>
  axios.post(`${API_BASE}/messages`, messageData, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const reactToMessage = (messageId, emoji, token) =>
  axios.post(`${API_BASE}/messages/${messageId}/react`, { emoji }, {
    headers: { Authorization: `Bearer ${token}` },
  });