import api from './api';

class PermissionService {
  async getAll(page = 1, limit = 100) { // Limit 100 pour tout voir d'un coup
    const response = await api.get('/permissions', { params: { page, limit } });
    return response.data; // Retourne { data: [...], meta: {...} }
  }
}
export default new PermissionService();