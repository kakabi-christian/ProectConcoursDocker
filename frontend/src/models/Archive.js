//models/Archive.js
export default class Archive {
  constructor(
    id,
    epreuveId,
    anneeId,
    epreuve = null,
    annee = null,
    fileUrl,
    createdAt,
    updatedAt
  ) {
    this.id = id;
    this.epreuveId = epreuveId;
    this.anneeId = anneeId;

    this.epreuve = epreuve;
    this.annee = annee;

    this.fileUrl = fileUrl; // image ou PDF de l’épreuve

    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
