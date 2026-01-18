// src/services/StatistiqueService.js
import api from './api';

const StatistiqueService = {
  // ===================== CANDIDATS =====================
  totalCandidats: async () => {
    const response = await api.get('/statistique/total-candidats');
    return response.data;
  },

  sexeCandidats: async () => {
    const response = await api.get('/statistique/sexe');
    return response.data;
  },

  pourcentageSexe: async () => {
    const response = await api.get('/statistique/pourcentage-sexe');
    return response.data;
  },

  candidatsParSpecialite: async () => {
    const response = await api.get('/statistique/candidats-par-specialite');
    return response.data;
  },

  candidatsParFiliere: async () => {
    const response = await api.get('/statistique/candidats-par-filiere');
    return response.data;
  },

  candidatsParTypeBac: async () => {
    const response = await api.get('/statistique/candidats-par-type-bac');
    return response.data;
  },

  candidatsParMention: async () => {
    const response = await api.get('/statistique/candidats-par-mention');
    return response.data;
  },

  // ===================== CONCOURS =====================
  candidatsParConcours: async () => {
    const response = await api.get('/statistique/candidats-par-concours');
    return response.data;
  },

  statutPaiementsParConcours: async () => {
    const response = await api.get('/statistique/statut-paiements-par-concours');
    return response.data;
  },

  // ===================== SESSIONS =====================
  candidatsParSession: async () => {
    const response = await api.get('/statistique/candidats-par-session');
    return response.data;
  },

  // ===================== PAIEMENTS =====================
  totalPaiements: async () => {
    const response = await api.get('/statistique/total-paiements');
    return response.data;
  },

  paiementsParMode: async () => {
    const response = await api.get('/statistique/paiements-par-mode');
    return response.data;
  },

  nombrePaiementsStatut: async () => {
    const response = await api.get('/statistique/nombre-paiements-statut');
    return response.data;
  },

  // ===================== REÇUS =====================
  statsRecus: async () => {
    const response = await api.get('/statistique/stats-recus');
    return response.data;
  },

  // ===================== ADMIN / UTILISATEURS =====================
  totalAdminsVsCandidats: async () => {
    const response = await api.get('/statistique/admins-vs-candidats');
    return response.data;
  },

  utilisateursVerifies: async () => {
    const response = await api.get('/statistique/utilisateurs-verifies');
    return response.data;
  },

  // ===================== FEEDBACKS / NOTIFICATIONS =====================
  feedbacksParUtilisateur: async () => {
    const response = await api.get('/statistique/feedbacks-par-utilisateur');
    return response.data;
  },

  notificationsStat: async () => {
    const response = await api.get('/statistique/notifications-stat');
    return response.data;
  },

  // ===================== STATISTIQUES COMBINÉES =====================
  statistiquesTableauDeBord: async () => {
    const response = await api.get('/statistique/dashboard');
    return response.data;
  },

  // ===================== NOUVELLES MÉTHODES (FRONTEND) =====================

  candidatsParRegionDetaille: async () => {
    const response = await api.get('/statistique/regions-detaillees');
    return response.data;
  },

  candidatsParTrancheAge: async () => {
    const response = await api.get('/statistique/tranches-age');
    return response.data;
  },

  statsParCentreExamen: async () => {
    const response = await api.get('/statistique/stats-centres-examen');
    return response.data;
  },

  statsParCentreDepot: async () => {
    const response = await api.get('/statistique/stats-centres-depot');
    return response.data;
  },

  tauxConversionPaiement: async () => {
    const response = await api.get('/statistique/taux-conversion');
    return response.data;
  },
};

export default StatistiqueService;
