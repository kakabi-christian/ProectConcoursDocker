// src/models/candidate.js
import { Dossier } from './dossier.model'; // Importe le modèle qu'on a créé

export const Sexe = {
  MASCULIN: 'MASCULIN',
  FEMININ: 'FEMININ',
};

/**
 * Modèle Candidat complet
 */
export class CandidateStep2 {
  constructor(data = {}) {
    // Identifiants
    this.id = data.id || ''; 
    this.userId = data.userId || '';
    this.matricule = data.matricule || '';

    // Infos Personnelles
    this.dateNaissance = data.dateNaissance || '';
    this.lieuNaissance = data.lieuNaissance || '';
    this.sexe = data.sexe || '';
    this.nationalite = data.nationalite || '';
    this.ville = data.ville || '';

    // Famille
    this.nomPere = data.nomPere || '';
    this.telephonePere = data.telephonePere || '';
    this.nomMere = data.nomMere || '';
    this.telephoneMere = data.telephoneMere || '';

    // 🔹 RELATION AVEC LE DOSSIER (Crucial pour le filtrage par statut)
    // On instancie le dossier s'il existe dans les données reçues
    this.dossier = data.dossier ? new Dossier(data.dossier) : null;

    // Champs calculés pour l'affichage facile dans le tableau
    this.specialiteId = data.specialiteId || '';
    this.nomComplet = data.user ? `${data.user.nom} ${data.user.prenom}` : '';
  }
}