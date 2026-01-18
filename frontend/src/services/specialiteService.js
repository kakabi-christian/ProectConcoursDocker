import api from './api';
import Specialite from '../models/Specialite';
const specialiteService = {
  /**
   * Récupère toutes les spécialités avec pagination et recherche
   * @param {Object} params - { page, limit, search }
   */
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/specialites', { params });
      return {
        data: response.data.data.map(item => new Specialite(item)),
        pagination: response.data.pagination
      };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Récupère les spécialités rattachées à une filière spécifique
   */
  getByFiliere: async (filiereId, params = {}) => {
    try {
      const response = await api.get(`/specialites/filiere/${filiereId}`, { params });
      return {
        data: response.data.data.map(item => new Specialite(item)),
        pagination: response.data.pagination
      };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Récupère une spécialité par son ID
   */
  getOne: async (id) => {
    try {
      const response = await api.get(`/specialites/${id}`);
      return new Specialite(response.data);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Crée une nouvelle spécialité
   */
  create: async (data) => {
    try {
      // data doit contenir { libelle, code, filiereId, isActive }
      const response = await api.post('/specialites', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Met à jour une spécialité existante
   */
  update: async (id, data) => {
    try {
      const response = await api.patch(`/specialites/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Supprime une spécialité
   */
  delete: async (id) => {
    try {
      const response = await api.delete(`/specialites/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default specialiteService;