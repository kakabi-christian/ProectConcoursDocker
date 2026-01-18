export default class Niveau {
  /**
   * Modèle pour représenter un Niveau Académique
   * @param {string} id - Identifiant unique (UUID)
   * @param {string} intitule - Nom complet (ex: Licence 1, Master)
   * @param {string} code - Code court (ex: L1, M1)
   * @param {number} ordre - Position pour le tri (ex: 1, 2, 3)
   * @param {Array} epreuves - Liste des épreuves liées (optionnel)
   * @param {string} createdAt - Date de création
   * @param {string} updatedAt - Date de modification
   */
  constructor(
    id,
    intitule,
    code = null,
    ordre = null,
    epreuves = [],
    createdAt = null,
    updatedAt = null
  ) {
    this.id = id;
    this.intitule = intitule;
    this.code = code;
    this.ordre = ordre;
    this.epreuves = epreuves;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Retourne le nom complet formaté pour l'affichage
   */
  get displayLabel() {
    return this.code ? `${this.code} - ${this.intitule}` : this.intitule;
  }
}