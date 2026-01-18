//src/services/centreDepotService.js
import api from './api';
const centreDepotService = {
  /**
   * Récupère la liste des centres avec pagination et recherche
   * @param {Object} params - { page, limit, search }
   */
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/centre-depot', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Récupère un centre spécifique par son ID
   */
  getOne: async (id) => {
    try {
      const response = await api.get(`/centre-depot/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Crée un nouveau centre de dépôt
   */
  create: async (data) => {
    try {
      // data doit contenir { intitule, lieuDepot }
      const response = await api.post('/centre-depot', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Met à jour un centre existant
   */
  update: async (id, data) => {
    try {
      const response = await api.patch(`/centre-depot/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Supprime un centre de dépôt
   */
  delete: async (id) => {
    try {
      const response = await api.delete(`/centre-depot/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default centreDepotService;