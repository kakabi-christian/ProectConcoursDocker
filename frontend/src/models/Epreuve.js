//models/Epreuve.js
export default class Epreuve {
  constructor(
    id,
    nomEpreuve,
    nonEliminatoire,
    filiereId,
    filiere = null,
    niveauId,
    niveau = null,
    archives = [],
    createdAt,
    updatedAt
  ) {
    this.id = id;
    this.nomEpreuve = nomEpreuve;
    this.nonEliminatoire = nonEliminatoire;
    this.filiereId = filiereId;
    this.filiere = filiere;
    this.niveauId = niveauId;
    this.niveau = niveau;
    this.archives = archives;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
