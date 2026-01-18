// models/Enrollment.js

class Enrollment {
  constructor(data = {}) {
    this.id = data.id || null;
    this.candidatId = data.candidatId || "";
    this.concoursId = data.concoursId || "";
    this.sessionId = data.sessionId || null;
    this.documentId = data.documentId || null;
    this.centreExamenId = data.centreExamenId || null;
    this.centreDepotId = data.centreDepotId || null;

    // --- PROPRIÉTÉS DE DISPATCHING ---
    this.salleId = data.salleId || null;
    this.numeroTable = data.numeroTable || null;

    // --- RELATIONS (Initialisées si présentes dans le JSON) ---
    this.candidat = data.candidat || null;
    this.concours = data.concours || null;
    this.session = data.session || null;
    this.salle = data.salle ? {
      id: data.salle.id,
      codeClasse: data.salle.codeClasse,
      batiment: data.salle.batiment || null
    } : null;
    this.centreExamen = data.centreExamen || null;
    this.centreDepot = data.centreDepot || null;

    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
  }

  // Petit helper pour afficher la localisation complète
  getLocalizedSeat() {
    if (!this.salleId) return "Non assigné";
    return `${this.salle.codeClasse} - Table n°${this.numeroTable}`;
  }
}

export default Enrollment;