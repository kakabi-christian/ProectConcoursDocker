import api from "./api";

/**
 * --- SERVICE DE GESTION DES SALLES ---
 */

/**
 * Récupérer la liste paginée des salles
 * @param {number} page 
 * @param {number} limit 
 */
export const getAllSalles = async (page = 1, limit = 10) => {
  try {
    const response = await api.get('/salle', {
      params: { page, limit }
    });
    return response.data; // Retourne { data: [], meta: {} }
  } catch (error) {
    console.error("[SalleService] Erreur récupération salles :", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Récupérer la liste simplifiée des bâtiments pour le <select>
 * Appelle la nouvelle route Get('list/batiments') créée dans le backend
 */
export const getBatimentsForSelect = async () => {
  try {
    const response = await api.get('/salle/list/batiments');
    return response.data; // Retourne [{id, nom, code}, ...]
  } catch (error) {
    console.error("[SalleService] Erreur récupération liste bâtiments :", error);
    throw error;
  }
};

/**
 * Créer une nouvelle salle
 * @param {Object} salleData - { batimentId: string, capacite: number }
 */
export const createSalle = async (salleData) => {
  try {
    // Rappel: le codeClasse est généré automatiquement par NestJS
    const response = await api.post('/salle', salleData);
    return response.data;
  } catch (error) {
    console.error("[SalleService] Erreur création salle :", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Mettre à jour une salle
 */
export const updateSalle = async (id, salleData) => {
  try {
    const response = await api.patch(`/salle/${id}`, salleData);
    return response.data;
  } catch (error) {
    console.error(`[SalleService] Erreur modification salle ${id} :`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * Supprimer une salle
 */
export const deleteSalle = async (id) => {
  try {
    const response = await api.delete(`/salle/${id}`);
    return response.data;
  } catch (error) {
    console.error(`[SalleService] Erreur suppression salle ${id} :`, error);
    throw error;
  }
};

export default {
  getAllSalles,
  getBatimentsForSelect,
  createSalle,
  updateSalle,
  deleteSalle
};