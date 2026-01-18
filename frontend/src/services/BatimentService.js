import api from "./api";

/**
 * --- SERVICE DE GESTION DES BÂTIMENTS ---
 */

/**
 * Récupérer la liste paginée des bâtiments
 * @param {number} page - Numéro de la page (défaut 1)
 * @param {number} limit - Nombre d'éléments par page (défaut 10)
 */
export const getAllBatiments = async (page = 1, limit = 10) => {
  try {
    const response = await api.get('/batiment', {
      params: { page, limit }
    });
    return response.data; // Retourne { data: [], meta: {} }
  } catch (error) {
    console.error("[BatimentService] Erreur récupération bâtiments :", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Récupérer un bâtiment spécifique par son ID
 */
export const getBatimentById = async (id) => {
  try {
    const response = await api.get(`/batiment/${id}`);
    return response.data;
  } catch (error) {
    console.error(`[BatimentService] Erreur récupération bâtiment ${id} :`, error);
    throw error;
  }
};

/**
 * Créer un nouveau bâtiment
 * @param {Object} batimentData - { nom: string, code: string }
 */
export const createBatiment = async (batimentData) => {
  try {
    const response = await api.post('/batiment', batimentData);
    return response.data;
  } catch (error) {
    console.error("[BatimentService] Erreur création bâtiment :", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Mettre à jour un bâtiment existant
 */
export const updateBatiment = async (id, batimentData) => {
  try {
    const response = await api.patch(`/batiment/${id}`, batimentData);
    return response.data;
  } catch (error) {
    console.error(`[BatimentService] Erreur modification bâtiment ${id} :`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * Supprimer un bâtiment
 */
export const deleteBatiment = async (id) => {
  try {
    const response = await api.delete(`/batiment/${id}`);
    return response.data;
  } catch (error) {
    console.error(`[BatimentService] Erreur suppression bâtiment ${id} :`, error);
    throw error;
  }
};

export default {
  getAllBatiments,
  getBatimentById,
  createBatiment,
  updateBatiment,
  deleteBatiment
};