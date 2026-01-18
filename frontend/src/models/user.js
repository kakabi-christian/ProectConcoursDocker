// src/models/user.js

// Enum des rôles
export const UserRole = {
  ADMIN: 'ADMIN',
  CANDIDATE: 'CANDIDATE',
};

// Enum des régions
export const Region = {
  ADAMAOUA: 'ADAMAOUA',
  CENTRE: 'CENTRE',
  EST: 'EST',
  EXTREME_NORD: 'EXTREME_NORD',
  LITTORAL: 'LITTORAL',
  NORD: 'NORD',
  NORD_OUEST: 'NORD_OUEST',
  OUEST: 'OUEST',
  SUD: 'SUD',
  SUD_OUEST: 'SUD_OUEST',
};

// Model utilisateur
export class User {
  constructor({
    id = null,
    nom = '',
    prenom = '',
    email = '',
    telephone = '',
    region = '',          // doit correspondre à une valeur de Region
    password = '',        // uniquement pour les admins
    role = UserRole.CANDIDATE, // rôle par défaut = CANDIDATE
    isVerified = true,
  } = {}) {
    this.id = id;
    this.nom = nom;
    this.prenom = prenom;
    this.email = email;
    this.telephone = telephone;
    this.region = region;
    this.password = password;
    this.role = role;
    this.isVerified = isVerified;
  }
}
