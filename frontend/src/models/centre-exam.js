//src/models/centre-exam.js
/**
 * Modèle représentant un Centre d'Examen
 * Champs Prisma : intitule, lieuCentre
 */
export default class CentreExamen {
  constructor({
    id = '',
    intitule = '',
    lieuCentre = '', // Optionnel selon votre schéma Prisma (String?)
    enrollements = [],
    _count = { enrollements: 0 },
    createdAt = null,
    updatedAt = null
  } = {}) {
    this.id = id;
    this.intitule = intitule;
    this.lieuCentre = lieuCentre;
    this.enrollements = enrollements;
    this.countEnrollements = _count?.enrollements || 0;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Validation simple pour le formulaire
   */
  static validate(data) {
    const errors = {};
    if (!data.intitule || data.intitule.trim().length < 3) {
      errors.intitule = "L'intitulé du centre d'examen est requis (min 3 car.).";
    }
    // lieuCentre est optionnel dans le schéma Prisma (String?), 
    // mais on peut ajouter une validation si nécessaire.
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}