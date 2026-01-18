import api from './api';
import Epreuve from '../models/Epreuve';

const epreuveService = {
  /**
   * Récupère les épreuves avec pagination et recherche
   * @param {Object} filters { page, limit, search, filiereId }
   */
  getAll: async (filters = {}) => {
    try {
      const response = await api.get('/epreuves', { params: filters });
      
      // Mappage des données sur le modèle Epreuve
      const items = response.data.data.map(item => new Epreuve(
        item.id,
        item.nomEpreuve,
        item.nonEliminatoire,
        item.filiereId,
        item.filiere,
        item.niveauId,
        item.niveau,
        item.archives,
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
   * Récupère une épreuve par ID
   */
  getOne: async (id) => {
    try {
      const response = await api.get(`/epreuves/${id}`);
      const item = response.data;
      return new Epreuve(
        item.id,
        item.nomEpreuve,
        item.nonEliminatoire,
        item.filiereId,
        item.filiere,
        item.niveauId,
        item.niveau,
        item.archives,
        item.createdAt,
        item.updatedAt
      );
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Récupère les épreuves d'une spécialité
   */
  getBySpecialite: async (specialiteId) => {
    try {
      const response = await api.get(`/epreuves/specialite/${specialiteId}`);
      return response.data.map(item => new Epreuve(
        item.id,
        item.nomEpreuve,
        item.nonEliminatoire,
        item.filiereId,
        item.filiere,
        item.niveauId,
        item.niveau,
        item.archives,
        item.createdAt,
        item.updatedAt
      ));
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Créer une épreuve
   */
  create: async (epreuveData) => {
    try {
      const response = await api.post('/epreuves', epreuveData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Modifier une épreuve
   */
  update: async (id, epreuveData) => {
    try {
      const response = await api.patch(`/epreuves/${id}`, epreuveData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Supprimer une épreuve
   */
  delete: async (id) => {
    try {
      const response = await api.delete(`/epreuves/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default epreuveService;