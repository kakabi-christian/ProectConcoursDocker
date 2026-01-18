import api from './api.js';

// Configuration de l'URL de base pour les téléchargements
const API_URL = 'http://localhost:3000'; 

// ==================== ANNEES ====================
export const getAnnees = async () => {
  console.log('📡 [API] Appel : GET /annees');
  try {
    const response = await api.get('/annees');
    return response;
  } catch (error) {
    console.error('❌ [API] Erreur getAnnees :', error);
    throw error;
  }
};

// ==================== DEPARTEMENTS ====================
export const getDepartements = async () => {
  try {
    const response = await api.get('/departements');
    return response;
  } catch (error) {
    console.error('❌ [API] Erreur getDepartements :', error);
    throw error;
  }
};

// ==================== FILIERES ====================
export const getFilieresByDepartement = async (id) => {
  try {
    const response = await api.get(`/filieres/departement/${id}`);
    return response;
  } catch (error) {
    console.error(`❌ Erreur getFilieresByDepartement (id=${id}) :`, error);
    throw error;
  }
};

// ==================== EPREUVES PAR SPECIALITE ====================
export const getEpreuvesBySpecialite = async (specialiteId) => {
  try {
    const response = await api.get(`/epreuves/specialite/${specialiteId}`);
    return response;
  } catch (error) {
    console.error(`❌ Erreur getEpreuvesBySpecialite (id=${specialiteId}) :`, error);
    throw error;
  }
};

// ==================== ARCHIVES ====================
export const getArchivesByEpreuve = async (id) => {
  try {
    const response = await api.get(`/archives/epreuve/${id}`);
    return response;
  } catch (error) {
    console.error(`❌ Erreur getArchivesByEpreuve (id=${id}) :`, error);
    throw error;
  }
};

// ==================== ARCHIVES PERSONNELLES (CANDIDAT) ====================

export const getMyArchivesBySpeciality = async (params = {}) => {
  const { anneeId, search } = params;
  try {
    const queryParams = new URLSearchParams();
    if (anneeId) queryParams.append('anneeId', anneeId);
    if (search) queryParams.append('search', search);

    const queryString = queryParams.toString();
    const url = `/archives/my-speciality${queryString ? `?${queryString}` : ''}`;

    const response = await api.get(url);
    return response;
  } catch (error) {
    console.error('❌ Erreur getMyArchivesBySpeciality :', error);
    throw error;
  }
};

// ==================== NOUVEAU : TELECHARGEMENT SECURISE ====================

/**
 * Déclenche le téléchargement d'un fichier via la route spécialisée du backend.
 * @param {string} fileUrl - L'URL stockée en base (ex: /uploads/abc.pdf)
 */
export const downloadArchiveFile = (fileUrl) => {
  if (!fileUrl) return;

  // On extrait juste le nom du fichier (ex: abc.pdf)
  const filename = fileUrl.split('/').pop();
  
  // On construit l'URL pointant vers notre nouvelle méthode du Controller
  const downloadUrl = `${API_URL}/archives/download/${filename}`;

  // On ouvre dans un nouvel onglet pour forcer le téléchargement
  window.open(downloadUrl, '_blank');
};