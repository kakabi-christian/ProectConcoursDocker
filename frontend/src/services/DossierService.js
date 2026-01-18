// src/services/DossierService.js
import api from './api';

/**
 * --- PARTIE CANDIDAT (Upload & Consultation) ---
 */

export const uploadDossierFile = async (candidateId, field, file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await api.post(`/dossiers/upload/${candidateId}/${field}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    console.error(`[DossierService] Erreur upload ${field} :`, error.response?.data || error.message);
    throw error;
  }
};

export const getDossierByCandidate = async (candidateId) => {
  try {
    const response = await api.get(`/dossiers/my-dossier/${candidateId}`);
    return response.data;
  } catch (error) {
    console.error(`[DossierService] Erreur récupération dossier ${candidateId} :`, error);
    throw error;
  }
};

/**
 * --- PARTIE ADMIN (Gestion & Validation) ---
 */

/**
 * Récupérer le nombre de dossiers en attente (Badge Admin)
 */
export const getPendingCount = async () => {
  try {
    const response = await api.get('/dossiers/count/pending');
    return response.data; // { pendingCount: X }
  } catch (error) {
    console.error('[DossierService] Erreur récupération compteur :', error);
    throw error;
  }
};

/**
 * Liste paginée des dossiers pour l'administration
 */
export const getAllDossiers = async (params = { page: 1, limit: 10 }) => {
  try {
    const response = await api.get('/dossiers', { params });
    return response.data;
  } catch (error) {
    console.error('[DossierService] Erreur récupération tous dossiers :', error);
    throw error;
  }
};

/**
 * Valider ou Rejeter un dossier complet
 */
export const updateDossierStatus = async (candidateId, statusData) => {
  try {
    const response = await api.patch(`/dossiers/${candidateId}/status`, statusData);
    return response.data;
  } catch (error) {
    console.error(`[DossierService] Erreur mise à jour statut dossier ${candidateId} :`, error);
    throw error;
  }
};

/**
 * Constantes de Statut
 */
export const DOSSIER_STATUS = {
  PENDING: 'PENDING',
  VALIDATED: 'VALIDATED',
  REJECTED: 'REJECTED'
};

/**
 * Helper pour construire l'URL complète d'une image/PDF
 * Utilise dynamiquement la baseURL de l'instance API
 */
export const getFileUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  
  // On récupère dynamiquement la baseURL définie dans ton api.js
  const baseUrl = api.defaults.baseURL; 
  
  // On s'assure qu'il n'y a pas de double slash
  const cleanBase = baseUrl.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${cleanBase}${cleanPath}`;
};
/**
 * Récupérer le QR Code d'un candidat par son userId
 */
export const getCandidateQrCode = async (userId) => {
  try {
    const response = await api.get(`/dossiers/candidate/qrcode/${userId}`);
    return response.data; // Retourne { qrCode: "data:image/png;base64,..." }
  } catch (error) {
    console.error(`[DossierService] Erreur récupération QR Code pour ${userId} :`, error);
    throw error;
  }
};

export default {
  uploadDossierFile,
  getDossierByCandidate,
  getPendingCount, // Ajouté ici
  getAllDossiers,
  updateDossierStatus,
  DOSSIER_STATUS,
  getFileUrl,
  getCandidateQrCode,
};