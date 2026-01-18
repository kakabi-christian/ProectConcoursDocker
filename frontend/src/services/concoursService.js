import api from './api.js';

/**
 * Récupérer tous les concours avec pagination et recherche
 */
export const getConcours = async (params = {}) => {
  try {
    const response = await api.get('/concours', { params });
    return response.data;
  } catch (error) {
    console.error('[getConcours] Erreur :', error);
    throw error;
  }
};
export const getActiveConcours = async (params = {}) => {
  try {
    // On passe les params pour que le backend puisse gérer la pagination (ex: ?page=1&limit=10)
    const response = await api.get('/concours/active', { params });
    return response.data;
  } catch (error) {
    console.error('[getActiveConcours] Erreur :', error);
    throw error;
  }
};
export const getConcoursById = async (id) => {
  try {
    const response = await api.get(`/concours/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Créer un concours
 * @param {Object} data - { code, intitule, montant, statut, dateDebutInscription, dateFinInscription, anneeId, sessionId, pieceDossierIds }
 */
export const createConcours = async (data) => {
  try {
    const response = await api.post('/concours', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateConcours = async (id, data) => {
  try {
    const response = await api.patch(`/concours/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteConcours = async (id) => {
  try {
    const response = await api.delete(`/concours/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getFormDataRequired = async () => {
  try {
    const [annees, sessions, pieces] = await Promise.all([
      api.get('/annee-academique'),
      api.get('/session'),
      api.get('/pieces-dossier')
    ]);

    return {
      annees: annees.data.data || annees.data,
      sessions: sessions.data.data || sessions.data,
      pieces: pieces.data
    };
  } catch (error) {
    throw error;
  }
};