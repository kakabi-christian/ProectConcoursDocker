// src/models/Role.js
export default class Role {
  constructor({
    id = '',
    name = '',
    description = '',
    permissions = [], // Liste des permissions associées
    users = [],       // Utilisateurs ayant ce rôle
    _count = { permissions: 0, users: 0 }, // Pour afficher les stats rapidement
    createdAt = null,
    updatedAt = null
  } = {}) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.permissions = permissions;
    this.users = users;
    this.count = _count;
    this.createdAt = createdAt ? new Date(createdAt) : null;
    this.updatedAt = updatedAt ? new Date(updatedAt) : null;
  }

  // Méthode utilitaire pour vérifier si le rôle possède une permission précise
  hasPermission(permissionName) {
    return this.permissions.some(p => 
      p.permission?.name === permissionName || p.name === permissionName
    );
  }
}