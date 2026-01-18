import api from './api';
import Admin from '../models/Admin';

class AdminService {
  /**
   * Crée un nouvel administrateur
   */
  async createAdmin(adminData) {
    try {
      // Nettoyage : on ne passe pas de chaînes vides pour les relations
      const payload = { ...adminData };
      if (!payload.departementId) delete payload.departementId;
      if (!payload.roleId) delete payload.roleId;

      const response = await api.post('/auth/register-admin', payload);
      return {
        message: response.data.message,
        admin: new Admin({ ...response.data.user, admin: response.data.admin })
      };
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  /**
   * Récupère la liste des administrateurs
   */
  async getAllAdmins(page = 1, limit = 5) {
    try {
      const response = await api.get('/auth/admins', {
        params: { page, limit }
      });
      
      return {
        data: response.data.data.map(item => new Admin(item)),
        meta: response.data.meta
      };
    } catch (error) {
      console.error("Erreur AdminService.getAllAdmins:", error);
      throw error.response?.data || error.message;
    }
  }

  /**
   * Met à jour les informations d'un administrateur (PATCH)
   */
  async updateAdmin(id, updateData) {
    try {
      // Nettoyage des données de mise à jour
      const payload = { ...updateData };
      if (payload.departementId === "") payload.departementId = null;
      if (payload.roleId === "") payload.roleId = null;

      const response = await api.patch(`/auth/admins/${id}`, payload);
      return new Admin(response.data);
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  /**
   * Supprime un administrateur (DELETE)
   */
  async deleteAdmin(id) {
    try {
      const response = await api.delete(`/auth/admins/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
}

export default new AdminService();