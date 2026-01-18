//src/models/centre-depot.js
/**
 * Modèle représentant un Centre de Dépôt
 * Correspond au modèle Prisma : intitule, lieuDepot
 */
export default class CentreDepot {
  constructor({
    id = '',
    intitule = '',
    lieuDepot = '',
    enrollements = [],
    createdAt = null,
    updatedAt = null
  } = {}) {
    this.id = id;
    this.intitule = intitule;
    this.lieuDepot = lieuDepot; // Assurez-vous d'utiliser ce nom exact
    this.enrollements = enrollements;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Méthode utilitaire pour valider les données avant envoi au backend
   */
  static validate(data) {
    const errors = {};
    if (!data.intitule || data.intitule.trim().length < 3) {
      errors.intitule = "L'intitulé doit contenir au moins 3 caractères.";
    }
    if (!data.lieuDepot || data.lieuDepot.trim().length < 2) {
      errors.lieuDepot = "Le lieu de dépôt est requis.";
    }
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}