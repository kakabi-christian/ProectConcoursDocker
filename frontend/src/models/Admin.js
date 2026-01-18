// src/models/Admin.js
import Role from './Role';

export default class Admin {
  constructor({
    id = '',
    email = '',
    nom = '',
    prenom = '',
    telephone = '',
    region = '',
    userType = 'ADMIN',
    isVerified = false,
    // Extension "admin" venant du backend
    admin = null, 
    // Liste des rôles
    roles = [],
    createdAt = null,
    updatedAt = null
  } = {}) {
    // Informations de base (User)
    this.id = id;
    this.email = email;
    this.nom = nom;
    this.prenom = prenom;
    this.fullName = `${prenom} ${nom}`;
    this.telephone = telephone;
    this.region = region;
    this.userType = userType;
    this.isVerified = isVerified;

    // Informations spécifiques (Admin Profile)
    this.codeAdmin = admin?.codeAdmin || '';
    this.departementId = admin?.departementId || '';
    this.departement = admin?.departement || null;

    // Transformation des rôles en instances de la classe Role
    this.roles = Array.isArray(roles) 
      ? roles.map(r => new Role(r.role || r)) 
      : [];

    this.createdAt = createdAt ? new Date(createdAt) : null;
    this.updatedAt = updatedAt ? new Date(updatedAt) : null;
  }

  /**
   * Vérifie si l'admin possède une permission spécifique
   * @param {string} permissionName 
   */
  hasPermission(permissionName) {
    return this.roles.some(role => role.hasPermission(permissionName));
  }

  /**
   * Vérifie si c'est un SuperAdmin
   */
  isSuperAdmin() {
    return this.userType === 'SUPERADMIN';
  }
}