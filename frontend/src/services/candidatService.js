import api from './api';

/**
 * Service pour gérer les opérations liées aux candidats et à la logistique
 */
const candidatService = {
  
  /**
   * RÉCUPÈRE TOUS LES CONCOURS
   */
  getConcours: async () => {
    console.log('📥 [candidatService] getConcours() appelé');
    try {
      const response = await api.get('/concours/list');
      console.log('✅ Concours récupérés');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getConcours', error.message);
      throw error;
    }
  },

  /**
   * RÉCUPÈRE LES SESSIONS D'UN CONCOURS PRÉCIS
   */
  getSessionsByConcours: async (concoursId) => {
    if (!concoursId) return [];
    console.log(`📥 [candidatService] getSessionsByConcours() pour concoursId: ${concoursId}`);
    try {
      const response = await api.get(`/concours/${concoursId}/sessions`);
      console.log('✅ Sessions récupérées');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getSessionsByConcours', error.message);
      return [];
    }
  },

  /**
   * RÉCUPÈRE L'INTITULÉ DU CONCOURS (Dashboard)
   */
  getDashboardConcoursInfo: async (userId) => {
    console.log(`📥 [candidatService] getDashboardConcoursInfo() pour userId: ${userId}`);
    try {
      const response = await api.get(`/candidates/dashboard/concours-info/${userId}`);
      console.log('✅ Infos concours récupérées');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getDashboardConcoursInfo', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * RÉCUPÈRE LA DATE CIBLE DU CONCOURS (Dashboard Countdown)
   */
  getDashboardCountdown: async (userId) => {
    console.log(`📥 [candidatService] getDashboardCountdown() pour userId: ${userId}`);
    try {
      const response = await api.get(`/candidates/dashboard/countdown/${userId}`);
      console.log('✅ Date countdown récupérée');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getDashboardCountdown', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Récupère la liste détaillée des candidats avec tous les filtres
   */
  getDetailedList: async (params = {}) => {
    console.log('📥 [candidatService] getDetailedList() appelé');

    const finalParams = {
      search: params.search || undefined,
      concoursId: params.concoursId || undefined, // AJOUTÉ
      sessionId: params.sessionId || undefined,   // AJOUTÉ
      filiereId: params.filiereId || undefined,
      specialiteId: params.specialiteId || undefined, 
      centreExamenId: params.centreExamenId || undefined, 
      centreDepotId: params.centreDepotId || undefined,   
      sexe: params.sexe || undefined,
      statut: params.statut || undefined, 
      page: params.page || 1,
      limit: params.limit || 10
    };

    try {
      console.log('🚀 Requête GET /candidates/list-detailed avec filtres...');
      const response = await api.get('/candidates/list-detailed', {
        params: finalParams
      });
      console.log('✅ Réponse API reçue');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getDetailedList', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * ======================================================
   * ALGORITHME DE DISPATCHING (AFFECTATION SALLES)
   * ======================================================
   */
  runDispatching: async (data) => {
    console.log('🚀 [candidatService] runDispatching() demandé...');
    // data contient: { concoursId, sessionId, centreExamenId, specialiteId }
    try {
      const response = await api.post('/dispatch/run', data);
      console.log('✅ Dispatching réussi:', response.data.stats);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur runDispatching', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Récupère les spécialités rattachées à une filière spécifique
   */
  getSpecialitesByFiliere: async (filiereId) => {
    if (!filiereId) return [];
    console.log(`📥 [candidatService] getSpecialitesByFiliere() pour filiereId: ${filiereId}`);
    try {
      const response = await api.get(`/candidates/specialites/${filiereId}`);
      console.log('✅ Spécialités filtrées récupérées');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getSpecialitesByFiliere', error.response?.data || error.message);
      return [];
    }
  },

  /**
   * Récupère toutes les filières
   */
  getFilieres: async () => {
    console.log('📥 [candidatService] getFilieres() appelé');
    try {
      const response = await api.get('/filieres');
      console.log('✅ Filières récupérées');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getFilieres', error.message);
      throw error;
    }
  },

  /**
   * Récupère les centres d'examen
   */
  getCentresExamen: async () => {
    console.log('📥 [candidatService] getCentresExamen() appelé');
    try {
      const response = await api.get('/centre-examen');
      console.log('✅ Centres d’examen récupérés');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getCentresExamen', error.message);
      throw error;
    }
  },

  /**
   * Récupère les centres de dépôt
   */
  getCentresDepot: async () => {
    console.log('📥 [candidatService] getCentresDepot() appelé');
    try {
      const response = await api.get('/centre-depot'); 
      console.log('✅ Centres de dépôt récupérés');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getCentresDepot', error.message);
      throw error;
    }
  },

  /**
   * EXPORTE LA LISTE DES CANDIDATS EN PDF
   */
  exportToPdf: async (filters = {}) => {
    console.log('📥 [candidatService] exportToPdf() demandé au serveur');
    try {
      const response = await api.get('/candidates/export/pdf', {
        params: filters,
        responseType: 'blob', 
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      const fileName = `Liste_Candidats_${new Date().toISOString().split('T')[0]}.pdf`;
      link.setAttribute('download', fileName);
      
      document.body.appendChild(link);
      link.click();
      
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('✅ PDF téléchargé avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de l’export PDF', error.message);
      throw error;
    }
  }
};

export default candidatService;