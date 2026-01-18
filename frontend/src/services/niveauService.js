import api from './api';
import Niveau from '../models/Niveau';

const niveauService = {
  /**
   * Récupère tous les niveaux avec pagination et filtres
   * @param {Object} filters { page, limit, search }
   */
  getAll: async (filters = {}) => {
    try {
      const response = await api.get('/niveaux', { params: filters });
      
      // Mappage des données sur le modèle Niveau
      const items = response.data.data.map(item => new Niveau(
        item.id,
        item.intitule,
        item.code,
        item.ordre,
        item.epreuves,
        item.createdAt,
        item.updatedAt
      ));

      return {
        data: items,
        pagination: response.data.pagination
      };
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Récupère un niveau spécifique par son ID
   */
  getOne: async (id) => {
    try {
      const response = await api.get(`/niveaux/${id}`);
      const item = response.data;
      return new Niveau(
        item.id,
        item.intitule,
        item.code,
        item.ordre,
        item.epreuves,
        item.createdAt,
        item.updatedAt
      );
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Crée un nouveau niveau
   */
  create: async (niveauData) => {
    try {
      const response = await api.post('/niveaux', niveauData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Met à jour un niveau existant
   */
  update: async (id, niveauData) => {
    try {
      const response = await api.patch(`/niveaux/${id}`, niveauData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Supprime un niveau
   */
  delete: async (id) => {
    try {
      const response = await api.delete(`/niveaux/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default niveauService;