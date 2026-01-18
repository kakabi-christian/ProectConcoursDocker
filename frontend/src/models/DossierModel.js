/**
 * Modèle de données Dossier (Frontend)
 */
export const DocStatus = {
  PENDING: 'PENDING',
  VALIDATED: 'VALIDATED',
  REJECTED: 'REJECTED'
};

// Structure type d'un objet Dossier venant du backend
export const InitialDossierState = {
  id: '',
  photoCni: null,        // URL du fichier
  photoDiplome: null,    // URL du fichier
  photoProfil: null,     // URL du fichier
  photoActeNaiss: null,  // URL du fichier
  photoRecuPaiement: null, // URL du fichier
  statut: DocStatus.PENDING,
  commentaire: '',
  candidateId: '',
  candidate: null,       // Objet complet du candidat (si inclus via include prisma)
  createdAt: null,
  updatedAt: null
};
