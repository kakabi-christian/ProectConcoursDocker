//src/services/filiereService.js
import api from './api';

const filiereService = {
  /**
   * Récupère toutes les filières avec filtres (pagination, recherche)
   * @param {Object} params - { page, limit, search }
   */
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/filieres', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Récupère une filière spécifique par son ID
   */
  getOne: async (id) => {
    try {
      const response = await api.get(`/filieres/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Récupère les filières liées à un département spécifique
   */
  getByDepartement: async (departementId, params = {}) => {
    try {
      const response = await api.get(`/filieres/departement/${departementId}`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Crée une nouvelle filière (Admin uniquement selon NestJS)
   */
  create: async (data) => {
    try {
      const response = await api.post('/filieres', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Met à jour une filière existante
   */
  update: async (id, data) => {
    try {
      const response = await api.patch(`/filieres/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Supprime une filière
   */
  delete: async (id) => {
    try {
      const response = await api.delete(`/filieres/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default filiereService;