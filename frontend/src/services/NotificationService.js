import api from "./api";

/**
 * Service pour la gestion des notifications
 */
const NotificationService = {
  /**
   * Récupérer les notifications avec pagination
   * @param {string} userId - ID de l'utilisateur
   * @param {number} page - Numéro de la page (défaut: 1)
   * @param {number} limit - Nombre d'éléments (défaut: 10)
   */
  async getByUserId(userId, page = 1, limit = 10) {
    const response = await api.get(`/notifications/user/${userId}`, {
      params: { page, limit }
    });
    return response.data;
  },

  /**
   * Récupérer le nombre de messages non lus (pour le badge Sidebar)
   * @param {string} userId
   */
  async getUnreadCount(userId) {
    const response = await api.get(`/notifications/unread-count/${userId}`);
    return response.data; // Retourne { unreadCount: X }
  },

  /**
   * Marquer une notification spécifique comme lue
   * @param {string} notificationId
   */
  async markAsRead(notificationId) {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },

  /**
   * Tout marquer comme lu pour un utilisateur
   * @param {string} userId
   */
  async markAllAsRead(userId) {
    const response = await api.patch(`/notifications/read-all/${userId}`);
    return response.data;
  },

  /**
   * Supprimer une notification
   * @param {string} notificationId
   */
  async delete(notificationId) {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  },

  /**
   * Supprimer tout l'historique
   * @param {string} userId
   */
  async deleteAll(userId) {
    const response = await api.delete(`/notifications/user/${userId}/all`);
    return response.data;
  }
};

export default NotificationService;