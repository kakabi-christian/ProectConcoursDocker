import api from './api';

const departementService = {
  /**
   * Récupère la liste des départements avec pagination et recherche
   * @param {Object} params { page, limit, search }
   */
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/departements', { 
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          search: params.search || ''
        }
      });
      // Le backend renvoie maintenant { data: [...], pagination: {...} }
      return response.data; 
    } catch (error) {
      console.error("Erreur lors de la récupération des départements:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/departements/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du département ${id}:`, error);
      throw error;
    }
  },

  create: async (data) => {
    const response = await api.post('/departements', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.patch(`/departements/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/departements/${id}`);
    return response.data;
  }
};

export default departementService;