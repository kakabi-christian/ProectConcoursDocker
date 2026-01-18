//src/services/FeedBackService.js
import api from './api';

const FeedbackService = {
  /**
   * Envoyer un nouveau feedback ou mettre à jour l'existant (Upsert)
   * @param {Object} feedbackData - Objet basé sur FeedbackModel { userId, comment, note }
   */
  async saveFeedback(feedbackData) {
    try {
      const response = await api.post('/feedbacks', feedbackData);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de l'envoi du feedback:", error);
      throw error;
    }
  },

  /**
   * Récupérer tous les feedbacks (utile pour l'administration)
   */
  async getAllFeedbacks() {
    try {
      const response = await api.get('/feedbacks');
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des feedbacks:", error);
      throw error;
    }
  },

  /**
   * Obtenir la moyenne de satisfaction de la plateforme
   */
  async getAverageRating() {
    try {
      const response = await api.get('/feedbacks/stats/average');
      return response.data; // Retourne { average: X }
    } catch (error) {
      console.error("Erreur lors de la récupération de la moyenne:", error);
      throw error;
    }
  }
};

export default FeedbackService;