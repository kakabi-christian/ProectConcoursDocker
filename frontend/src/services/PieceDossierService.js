// src/services/PieceDossierService.js
import api from './api';

const PieceDossierService = {
  /**
   * Créer une nouvelle pièce (Admin)
   * POST /pieces-dossier
   * @Permissions('creer_piece_dossier')
   */
  create: async (dto) => {
    try {
      const response = await api.post('/pieces-dossier', dto);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Récupérer toutes les pièces (Public)
   * GET /pieces-dossier
   * @Public()
   */
  findAll: async () => {
    try {
      const response = await api.get('/pieces-dossier');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Récupérer une pièce par son ID (Public)
   * GET /pieces-dossier/:id
   * @Public()
   */
  findOne: async (id) => {
    try {
      const response = await api.get(`/pieces-dossier/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Modifier une pièce (Admin)
   * PATCH /pieces-dossier/:id
   * @Permissions('modifier_piece_dossier')
   */
  update: async (id, dto) => {
    try {
      const response = await api.patch(`/pieces-dossier/${id}`, dto);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Supprimer une pièce (Admin)
   * DELETE /pieces-dossier/:id
   * @Permissions('supprimer_piece_dossier')
   */
  remove: async (id) => {
    try {
      const response = await api.delete(`/pieces-dossier/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default PieceDossierService;