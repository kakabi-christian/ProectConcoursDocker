// src/models/PieceDossierModel.js

/**
 * Structure d'une PieceDossier
 * @property {string} nom - Le nom affiché (ex: "Photo CNI")
 * @property {string} code - Le nom technique (ex: "photoCni") correspond à la colonne en base de données
 */

export const PieceDossierModel = {
  nom: '',
  code: '',
};

// Exemple de données pour tester tes formulaires
export const pieceDossierExample = {
  nom: "Diplôme du Baccalauréat",
  code: "photoDiplome"
};