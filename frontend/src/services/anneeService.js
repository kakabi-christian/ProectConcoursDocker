import api from './api';
import Annee from '../models/Annee';

const anneeService = {
  /**
   * Récupère toutes les années académiques avec pagination et recherche
   * @param {Object} params - { page, limit, search }
   */
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/annees', { params });
      
      // On transforme les données brutes en instances de la classe Annee
      const formattedData = response.data.data.map(item => new Annee(
        item.id,
        item.libelle,
        item.dateDebut,
        item.dateFin,
        item.estActive,
        item.concours || [],
        item.archives || [],
        item.createdAt,
        item.updatedAt
      ));

      return {
        data: formattedData,
        pagination: response.data.pagination,
        // On peut aussi récupérer le count des concours si renvoyé par le backend
        counts: response.data.data.map(item => ({ 
          id: item.id, 
          concoursCount: item._count?.concours || 0 
        }))
      };
    } catch (error) {
      console.error("[anneeService] Erreur getAll:", error);
      throw error;
    }
  },

  /**
   * Récupère une année spécifique par son ID
   */
  getOne: async (id) => {
    try {
      const response = await api.get(`/annees/${id}`);
      const item = response.data;
      return new Annee(
        item.id,
        item.libelle,
        item.dateDebut,
        item.dateFin,
        item.estActive,
        item.concours,
        item.archives,
        item.createdAt,
        item.updatedAt
      );
    } catch (error) {
      console.error(`[anneeService] Erreur getOne (${id}):`, error);
      throw error;
    }
  },

  /**
   * Crée une nouvelle année académique
   * @param {Object} data - { libelle, dateDebut, dateFin, estActive }
   */
  create: async (data) => {
    try {
      const response = await api.post('/annees', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Met à jour une année académique
   */
  update: async (id, data) => {
    try {
      const response = await api.patch(`/annees/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Supprime une année académique
   */
  delete: async (id) => {
    try {
      const response = await api.delete(`/annees/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default anneeService;