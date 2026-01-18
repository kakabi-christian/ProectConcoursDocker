/**
 * Modèle représentant une Spécialité
 * Champs Prisma : libelle, code, isActive, filiereId
 */
export default class Specialite {
  constructor({
    id = '',
    libelle = '',
    code = '',
    isActive = true,
    filiereId = null,
    filiere = null, // Objet filiere complet si inclus (include)
    createdAt = null,
    updatedAt = null
  } = {}) {
    this.id = id;
    this.libelle = libelle;
    this.code = code;
    this.isActive = isActive;
    this.filiereId = filiereId;
    this.filiere = filiere; // Permet d'accéder à f.filiere.intitule
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Validation pour les formulaires de création/modification
   */
  static validate(data) {
    const errors = {};
    if (!data.libelle || data.libelle.trim().length < 2) {
      errors.libelle = "Le libellé est requis (min 2 car.).";
    }
    if (!data.code || data.code.trim().length < 2) {
      errors.code = "Le code de la spécialité est requis.";
    }
    if (!data.filiereId) {
      errors.filiereId = "Veuillez sélectionner une filière.";
    }
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}