//src/services/centreExamen.js
import api from './api';
import CentreExamen from '../models/centre-exam';

const centreExamenService = {
  /**
   * Récupère la liste des centres d'examen avec pagination et recherche
   * @param {Object} params - { page, limit, search }
   */
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/centre-examen', { params });
      // On peut mapper les données avec le modèle si nécessaire
      return {
        data: response.data.data.map(item => new CentreExamen(item)),
        pagination: response.data.pagination
      };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Récupère un centre d'examen par son ID
   */
  getOne: async (id) => {
    try {
      const response = await api.get(`/centre-examen/${id}`);
      return new CentreExamen(response.data);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Crée un nouveau centre d'examen
   */
  create: async (data) => {
    try {
      // data doit correspondre aux champs : intitule, lieuCentre
      const response = await api.post('/centre-examen', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Met à jour un centre d'examen existant
   */
  update: async (id, data) => {
    try {
      const response = await api.patch(`/centre-examen/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Supprime un centre d'examen
   */
  delete: async (id) => {
    try {
      const response = await api.delete(`/centre-examen/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default centreExamenService;