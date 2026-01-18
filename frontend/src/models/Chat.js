/**
 * 🔹 Modèles de données pour le Chat (Structures de référence)
 * Ces structures correspondent aux retours de ton Backend NestJS / Prisma
 */

/**
 * Structure d'un Message
 */
export const createMessageModel = (data) => ({
  id: data.id || '',
  content: data.content || '',
  senderId: data.senderId || '',
  conversationId: data.conversationId || '',
  isRead: data.isRead || false,
  createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
  // Infos de l'expéditeur (jointure via Admin -> User)
  sender: data.sender ? {
    nom: data.sender.user?.nom || 'Anonyme',
    prenom: data.sender.user?.prenom || '',
    image: data.sender.user?.image || null
  } : null
});

/**
 * Structure d'une Conversation (Liste de gauche)
 */
export const createConversationModel = (data) => ({
  id: data.id || '',
  updatedAt: data.updatedAt || '',
  // Participants à la discussion
  participants: (data.participants || []).map(p => ({
    adminId: p.adminId,
    nom: p.admin?.user?.nom || '',
    prenom: p.admin?.user?.prenom || '',
    image: p.admin?.user?.image || null
  })),
  // Dernier message (pour l'aperçu style WhatsApp)
  lastMessage: data.messages && data.messages.length > 0 
    ? createMessageModel(data.messages[0]) 
    : null,
  // Compteur de messages non lus
  unreadCount: data._count?.messages || 0
});

/**
 * Structure d'un Contact (Admin à contacter)
 */
export const createContactModel = (data) => ({
  adminId: data.id || '',
  userId: data.userId || '',
  nom: data.user?.nom || '',
  prenom: data.user?.prenom || '',
  email: data.user?.email || '',
  image: data.user?.image || null,
  userType: data.user?.userType || 'ADMIN'
});