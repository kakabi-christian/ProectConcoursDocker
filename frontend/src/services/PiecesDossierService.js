// src/services/pieceDossierService.js
import api from './api.js';

/**
 * Récupérer toutes les pièces du dossier
 */
export const getPiecesDossier = async () => {
  console.log('[getPiecesDossier] Début de la récupération des pièces...');
  try {
    console.log('[getPiecesDossier] Appel de l\'API /pieces-dossier...');
    const response = await api.get('/pieces-dossier');
    console.log('[getPiecesDossier] Réponse reçue :', response);
    console.log('[getPiecesDossier] Données extraites :', response.data);
    return response.data;
  } catch (error) {
    console.error('[getPiecesDossier] Erreur lors de la récupération des pièces :', error);
    if (error.response) {
      console.error('[getPiecesDossier] Détails de la réponse erreur :', error.response.data);
      console.error('[getPiecesDossier] Status code :', error.response.status);
    }
    throw error;
  } finally {
    console.log('[getPiecesDossier] Fin de la fonction getPiecesDossier.');
  }
};

/**
 * Récupérer une pièce par ID
 * @param {string} id - ID de la pièce
 */
export const getPieceDossierById = async (id) => {
  console.log(`[getPieceDossierById] Début de la récupération de la pièce avec ID : ${id}`);
  try {
    console.log(`[getPieceDossierById] Appel de l'API /pieces-dossier/${id}...`);
    const response = await api.get(`/pieces-dossier/${id}`);
    console.log(`[getPieceDossierById] Réponse reçue :`, response);
    console.log(`[getPieceDossierById] Données extraites :`, response.data);
    return response.data;
  } catch (error) {
    console.error(`[getPieceDossierById] Erreur lors de la récupération de la pièce ${id} :`, error);
    if (error.response) {
      console.error(`[getPieceDossierById] Détails de la réponse erreur :`, error.response.data);
      console.error(`[getPieceDossierById] Status code :`, error.response.status);
    }
    throw error;
  } finally {
    console.log(`[getPieceDossierById] Fin de la fonction getPieceDossierById pour ID : ${id}`);
  }
};

/**
 * Valider des pièces (envoi au backend)
 * @param {string[]} pieceIds - IDs des pièces à valider
 */
export const validatePieces = async (pieceIds) => {
  console.log('[validatePieces] Début de la validation des pièces :', pieceIds);
  try {
    const response = await api.post('/pieces-dossier/validate', { pieceIds });
    console.log('[validatePieces] Réponse reçue :', response);
    return response.data;
  } catch (error) {
    console.error('[validatePieces] Erreur lors de la validation des pièces :', error);
    if (error.response) {
      console.error('[validatePieces] Détails de la réponse erreur :', error.response.data);
      console.error('[validatePieces] Status code :', error.response.status);
    }
    throw error;
  } finally {
    console.log('[validatePieces] Fin de la fonction validatePieces.');
  }
};
