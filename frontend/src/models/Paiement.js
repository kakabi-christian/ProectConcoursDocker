// src/models/Paiement.js

// On n'utilise plus d'interface TS, juste un objet de référence
export const Paiement = {
  id: '',
  nomComplet: '',
  prenom: '',
  email: '',
  telephone: '',
  concoursId: '',
  modePaiement: '',       // "ORANGE_MONEY" ou "MTN_MOMO"
  montantTotal: 0,
  statut: '',             // PENDING, SUCCESS, FAILED
  datePaiement: '',
};
