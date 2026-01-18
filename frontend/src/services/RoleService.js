//src/services/RoleService.js
import api from './api';
import Role from '../models/Role';

class RoleService {
  /**
   * Récupère la liste des rôles avec pagination
   * @param {number} page 
   * @param {number} limit 
   * @returns {Promise<{data: Role[], meta: object}>}
   */
  async getAll(page = 1, limit = 10) {
    try {
      const response = await api.get(`/roles`, {
        params: { page, limit }
      });
      
      // On transforme les données brutes en instances de la classe Role
      return {
        data: response.data.data.map(item => new Role(item)),
        meta: response.data.meta
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Récupère un rôle spécifique avec ses permissions
   * @param {string} id 
   */
  async getById(id) {
    try {
      const response = await api.get(`/roles/${id}/details`);
      return new Role(response.data);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Crée un nouveau rôle
   * @param {object} roleData { name, description }
   */
  async create(roleData) {
    try {
      const response = await api.post('/roles', roleData);
      return new Role(response.data);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Met à jour les informations de base d'un rôle
   */
  async update(id, roleData) {
    try {
      const response = await api.patch(`/roles/${id}`, roleData);
      return new Role(response.data);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Assigne des permissions à un rôle (Action spécifique SuperAdmin)
   * @param {string} roleId 
   * @param {string[]} permissionIds Tableau d'IDs de permissions
   */
  async assignPermissions(roleId, permissionIds) {
    try {
      const response = await api.patch(`/roles/${roleId}/permissions`, {
        permissionIds
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Supprime un rôle
   */
  async delete(id) {
    try {
      const response = await api.delete(`/roles/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new RoleService();