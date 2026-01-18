// src/models/documents.js

/**
 * 🔹 Enum Type de BAC
 */
export const TypeBac = {
  GENERAL: 'GENERAL',
  TECHNIQUE: 'TECHNIQUE',
};

/**
 * 🔹 Enum Mention
 */
export const TypeMention = {
  PASSABLE: 'PASSABLE',
  ASSEZ_BIEN: 'ASSEZ_BIEN',
  BIEN: 'BIEN',
  TRES_BIEN: 'TRES_BIEN',
  EXCELLENT: 'EXCELLENT',
};

/**
 * 🔹 Structure des données STEP 3 (Documents)
 * Correspond exactement au RegisterCandidateStep3Dto
 */
export const DocumentStep3Model = {
  candidateId: '',   // UUID
  numeroCni: '',     // optionnel
  typeExamen: '',    // TypeBac
  serie: '',         // optionnel
  Mention: '',       // TypeMention
};
