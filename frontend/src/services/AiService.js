import api from './api'; // Importation de ton instance axios configurée

const AiService = {
  /**
   * Envoie le message à l'IA via le backend NestJS
   * @param {string} message - La question de l'utilisateur
   */
  async sendMessage(message) {
    try {
      // 1. Récupération de l'ID utilisateur depuis le localStorage
      // On utilise les clés standards de ton app (vu dans tes logs dashboard)
      const storedUser = localStorage.getItem('user');
      const userData = storedUser ? JSON.parse(storedUser) : null;
      
      // On récupère soit l'id dans l'objet user, soit la clé directe userId
      const userId = userData?.id || localStorage.getItem('userId');

      console.log("🚀 [AI-SERVICE] Envoi du message pour l'ID:", userId);

      // 2. Envoi du message ET du userId au backend
      // On utilise 'api' pour que le token JWT soit aussi présent dans le header
      const response = await api.post('/ai/chat', { 
        message, 
        userId 
      });
      
      // On retourne la réponse formatée du backend
      return response.data; 
    } catch (error) {
      console.error("❌ [AI-SERVICE] Erreur lors de l'envoi du message:", error);
      throw error;
    }
  }
};

export default AiService;