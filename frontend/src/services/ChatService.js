// services/ChatService.js
import api from './api';
import { 
  createMessageModel, 
  createConversationModel, 
  createContactModel 
} from '../models/Chat'; 

const ChatService = {
  /**
   * 🔹 Récupère la liste des conversations (Barre latérale)
   */
  getMyConversations: async () => {
    try {
      const response = await api.get('/chat/conversations');
      return response.data.map(conv => createConversationModel(conv));
    } catch (error) {
      console.error("Erreur lors de la récupération des conversations:", error);
      throw error;
    }
  },

  /**
   * 🔹 Récupère l'historique des messages d'une conversation
   */
  getConversationMessages: async (conversationId) => {
    try {
      const response = await api.get(`/chat/messages/${conversationId}`);
      return response.data.map(msg => createMessageModel(msg));
    } catch (error) {
      console.error(`Erreur messages conversation ${conversationId}:`, error);
      throw error;
    }
  },

  /**
   * 🔹 Initialise ou récupère une conversation avec un admin
   */
  getOrCreateConversation: async (targetAdminId) => {
    try {
      const response = await api.post(`/chat/conversation/init/${targetAdminId}`);
      return createConversationModel(response.data);
    } catch (error) {
      console.error("Erreur lors de l'initialisation de la conversation:", error);
      throw error;
    }
  },

  /**
   * 🔹 Envoyer un message
   */
  sendMessage: async (conversationId, content) => {
    try {
      const response = await api.post('/chat/send', { conversationId, content });
      return createMessageModel(response.data);
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      throw error;
    }
  },

  /**
   * 🔹 Modifier un message existant
   * Route: PATCH /chat/message/:messageId
   */
  editMessage: async (messageId, newContent) => {
    try {
      const response = await api.patch(`/chat/message/${messageId}`, { content: newContent });
      return createMessageModel(response.data);
    } catch (error) {
      console.error("Erreur lors de la modification du message:", error);
      throw error;
    }
  },

  /**
   * 🔹 Supprimer un message
   * Route: DELETE /chat/message/:messageId
   */
  deleteMessage: async (messageId) => {
    try {
      const response = await api.delete(`/chat/message/${messageId}`);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la suppression du message:", error);
      throw error;
    }
  },

  /**
   * 🔹 Transférer un message vers une autre discussion
   * Route: POST /chat/message/forward
   */
  forwardMessage: async (messageId, targetConversationId) => {
    try {
      const response = await api.post('/chat/message/forward', { 
        messageId, 
        targetConversationId 
      });
      return createMessageModel(response.data);
    } catch (error) {
      console.error("Erreur lors du transfert du message:", error);
      throw error;
    }
  },

  /**
   * 🔹 Épingler un message
   * @param {string} messageId 
   * @param {number} days - Durée (3, 7 ou 30)
   * Route: POST /chat/message/pin/:messageId
   */
  pinMessage: async (messageId, days) => {
    try {
      const response = await api.post(`/chat/message/pin/${messageId}`, { days });
      return createMessageModel(response.data);
    } catch (error) {
      console.error("Erreur lors de l'épinglage du message:", error);
      throw error;
    }
  },

  /**
   * 🔹 Récupérer les messages épinglés d'une conversation
   * Route: GET /chat/pinned/:conversationId
   */
  getPinnedMessages: async (conversationId) => {
    try {
      const response = await api.get(`/chat/pinned/${conversationId}`);
      return response.data.map(msg => createMessageModel(msg));
    } catch (error) {
      console.error("Erreur lors de la récupération des messages épinglés:", error);
      throw error;
    }
  },

  /**
   * 🔹 Marquer les messages comme lus
   */
  markAsRead: async (conversationId) => {
    try {
      const response = await api.post(`/chat/read/${conversationId}`);
      return response.data;
    } catch (error) {
      console.error("Erreur markAsRead:", error);
      throw error;
    }
  },

  /**
   * 🔹 Récupérer la liste des contacts
   */
  getContacts: async (page = 1, limit = 10) => {
    try {
      const response = await api.get('/chat/contacts', {
        params: { page, limit }
      });
      return {
        contacts: response.data.data.map(admin => createContactModel(admin)),
        meta: response.data.meta
      };
    } catch (error) {
      console.error("Erreur lors de la récupération des contacts:", error);
      throw error;
    }
  },
  /**
   * 🔹 Récupérer le nombre total de messages non lus (pour le badge Sidebar)
   * Route: GET /chat/unread-count
   */
  getUnreadMessagesCount: async () => {
    try {
      const response = await api.get('/chat/unread-count');
      return response.data.unreadCount; // Retourne directement le nombre (ex: 5)
    } catch (error) {
      console.error("Erreur lors de la récupération du compteur de messages non lus:", error);
      return 0; // Retourne 0 en cas d'erreur pour ne pas bloquer l'affichage
    }
  },
  /**
   * 🔹 NOUVEAU : Récupérer le détail des messages non lus par conversation/admin
   * Utile pour afficher : "Angela (12)", "Frédéric (8)"
   * Route: GET /chat/unread-details
   */
  getUnreadMessagesDetails: async () => {
    try {
      const response = await api.get('/chat/unread-details');
      return response.data; // Retourne [{ conversationId, count, senderName }]
    } catch (error) {
      console.error("Erreur lors de la récupération du détail des messages non lus:", error);
      return [];
    }
  },
};


export default ChatService;