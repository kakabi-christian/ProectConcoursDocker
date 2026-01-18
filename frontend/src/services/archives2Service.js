import api from './api.js';

const archive2Service = {
  /**
   * Récupère toutes les archives avec pagination et filtres
   * @param {Object} filters - { page, limit, search, epreuveId, anneeId }
   */
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    try {
      const response = await api.get(`/archives?${params}`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getAll archives:', error);
      throw error;
    }
  },

  /**
   * Upload une nouvelle archive (PDF/Image)
   * @param {FormData} formData - Doit contenir 'file', 'epreuveId' et 'anneeId'
   */
  create: async (formData) => {
    try {
      // Important : Pour l'upload, on envoie le formData tel quel
      const response = await api.post('/archives/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('❌ Erreur upload archive:', error);
      throw error;
    }
  },

  /**
   * Récupère les archives d'une épreuve spécifique
   */
  getByEpreuve: async (epreuveId, page = 1) => {
    try {
      const response = await api.get(`/archives/epreuve/${epreuveId}?page=${page}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur archives pour épreuve ${epreuveId}:`, error);
      throw error;
    }
  },

  /**
   * Supprime une archive
   */
  delete: async (id) => {
    try {
      const response = await api.delete(`/archives/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur suppression archive ${id}:`, error);
      throw error;
    }
  },

  /**
   * Met à jour les informations d'une archive
   */
  update: async (id, data) => {
    try {
      const response = await api.patch(`/archives/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur mise à jour archive ${id}:`, error);
      throw error;
    }
  }
};

// --- MÉTHODES UTILITAIRES POUR LES COMPOSANTS ---

export const getAnnees = async () => {
  const response = await api.get('/annees');
  return response.data;
};

export const getDepartements = async () => {
  const response = await api.get('/departements');
  return response.data;
};

export const getFilieresByDepartement = async (id) => {
  const response = await api.get(`/filieres/departement/${id}`);
  return response.data;
};

export const getEpreuvesBySpecialite = async (specialiteId) => {
  const response = await api.get(`/epreuves/specialite/${specialiteId}`);
  return response.data;
};

export default archive2Service;