import api from './api';
import { Session } from '../models/Session';

const sessionService = {
  /**
   * Récupère toutes les sessions avec pagination et recherche
   * @param {Object} params - { page, limit, search }
   */
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/sessions', { params });
      
      // On mappe les données sur votre modèle Session
      const formattedData = response.data.data.map(item => ({
        ...Session,
        ...item,
        // On inclut les compteurs et relations spécifiques
        concours: item.concours || null,
        enrollementsCount: item._count?.enrollements || 0
      }));

      return {
        data: formattedData,
        pagination: response.data.pagination
      };
    } catch (error) {
      console.error("[sessionService] Erreur getAll:", error);
      throw error;
    }
  },

  /**
   * Récupère une session par son ID
   */
  getOne: async (id) => {
    try {
      const response = await api.get(`/sessions/${id}`);
      return { ...Session, ...response.data };
    } catch (error) {
      console.error(`[sessionService] Erreur getOne (${id}):`, error);
      throw error;
    }
  },

  /**
   * Crée une nouvelle session
   * @param {Object} data - { nom, dateDebut, dateFin }
   */
  create: async (data) => {
    try {
      const response = await api.post('/sessions', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Met à jour une session existante
   */
  update: async (id, data) => {
    try {
      const response = await api.patch(`/sessions/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Supprime une session
   */
  delete: async (id) => {
    try {
      const response = await api.delete(`/sessions/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default sessionService;