// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Liste des routes publiques qui ne nécessitent pas de token (ex: paiement, liste concours)
const PUBLIC_ROUTES = [
  '/paiement',
  '/paiement/check-status',
  '/concours'
];

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    
    // Vérifier si la route actuelle est publique
    const isPublicRoute = PUBLIC_ROUTES.some(route => config.url.includes(route));

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`[API] Token injecté pour: ${config.url}`);
    } else {
      // On ne log un warning que si la route est censée être protégée
      if (!isPublicRoute) {
        console.warn(`[API] Requête vers une route protégée sans token : ${config.url}`);
      } else {
        console.log(`[API] Requête publique (sans token) : ${config.url}`);
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;