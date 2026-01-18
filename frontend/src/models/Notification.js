export const NotificationType = {
  INFO: 'INFO',
  SUCCESS: 'SUCCESS',
  WARNING: 'WARNING',
  ERROR: 'ERROR',
  DOSSIER_STATUS: 'DOSSIER_STATUS'
};

export default class Notification {
  /**
   * Modèle pour représenter une Notification
   * @param {string} id - Identifiant unique
   * @param {string} userId - ID de l'utilisateur destinataire
   * @param {string} message - Contenu de la notification
   * @param {string} type - Type (INFO, SUCCESS, etc.)
   * @param {boolean} isRead - Statut de lecture
   * @param {boolean} isBroadcast - Si c'est un message général
   * @param {string|Date} createdAt - Date de création
   * @param {string|Date} updatedAt - Date de modification
   */
  constructor(
    id,
    userId,
    message,
    type = NotificationType.INFO,
    isRead = false,
    isBroadcast = false,
    createdAt = null,
    updatedAt = null
  ) {
    this.id = id;
    this.userId = userId;
    this.message = message;
    this.type = type;
    this.isRead = isRead;
    this.isBroadcast = isBroadcast;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Retourne une icône ou une couleur selon le type (utilitaire UI)
   */
  get statusTheme() {
    switch (this.type) {
      case NotificationType.SUCCESS: return 'success';
      case NotificationType.ERROR: return 'danger';
      case NotificationType.WARNING: return 'warning';
      default: return 'info';
    }
  }

  /**
   * Formate la date de création de manière lisible
   */
  get formattedDate() {
    if (!this.createdAt) return "";
    return new Date(this.createdAt).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}