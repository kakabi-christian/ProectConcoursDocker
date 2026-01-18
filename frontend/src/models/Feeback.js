//src/models/feedback.js
/**
 * Modèle Feedback
 * Permet à un candidat de noter la plateforme (1 à 5) et de laisser un commentaire.
 * Utilisé pour l'opération d'Upsert (création ou mise à jour).
 */
export class FeedbackModel {
  constructor({
    userId = '',    // 🔹 ID de l'utilisateur connecté
    comment = '',   // 🔹 Texte de l'avis (min 10 car.)
    note = 5,       // 🔹 Note entière de 1 à 5
  } = {}) {
    this.userId = userId;
    this.comment = comment;
    this.note = note;
  }
}