//models/Departement.js
export default class Departement {
  constructor(
    id,
    nomDep,
    filieres = [],
    admins = [],
    createdAt,
    updatedAt
  ) {
    this.id = id;
    this.nomDep = nomDep;
    this.filieres = filieres;
    this.admins = admins;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
