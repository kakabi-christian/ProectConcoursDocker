// Version plus robuste
export default class Filiere {
  constructor({
    id = '',
    intitule = '',
    description = '',
    departementId = '',
    departement = null,
    epreuves = [],
    createdAt = null,
    updatedAt = null
  } = {}) {
    this.id = id;
    this.intitule = intitule;
    this.description = description;
    this.departementId = departementId;
    this.departement = departement;
    this.epreuves = epreuves;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}