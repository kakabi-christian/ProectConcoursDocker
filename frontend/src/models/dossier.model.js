// src/app/models/dossier.model.js

// src/app/models/dossier.model.js

/**
 * Enumération pour le statut des dossiers
 * Doit correspondre exactement aux valeurs de DocStatus dans Prisma
 */
export const DocStatus = {
  PENDING: 'PENDING',   // En attente
  VALIDATED: 'VALIDATED', // Accepté
  REJECTED: 'REJECTED'  // Refusé
};

/**
 * Modèle Dossier — Aligné sur le schéma Prisma
 */
export class Dossier {
  constructor(data = {}) {
    this.id = data.id || null;
    
    // Fichiers (URLs ou Chemins stockés en DB)
    this.photoCni = data.photoCni || null;
    this.photoDiplome = data.photoDiplome || null;
    this.photoProfil = data.photoProfil || null;
    this.photoActeNaiss = data.photoActeNaiss || null;
    this.photoRecuPaiement = data.photoRecuPaiement || null;

    // Statut et Suivi
    this.statut = data.statut || DocStatus.PENDING;
    this.commentaire = data.commentaire || '';

    // Relations
    this.candidateId = data.candidateId || '';

    // Dates
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
  }

  /**
   * Méthode utilitaire pour vérifier si le dossier est complet
   */
  isComplete() {
    return !!(this.photoCni && this.photoDiplome && this.photoActeNaiss);
  }
}