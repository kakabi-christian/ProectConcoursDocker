//models/Anne.js
export default class Annee {
  constructor(
    id,
    libelle,
    dateDebut,
    dateFin,
    estActive,
    concours = [],
    archives = [],
    createdAt,
    updatedAt
  ) {
    this.id = id;
    this.libelle = libelle;
    this.dateDebut = dateDebut;
    this.dateFin = dateFin;
    this.estActive = estActive;
    this.concours = concours;
    this.archives = archives;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
