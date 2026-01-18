import api from './api.js';


/**
 * 🔹 Changer le mot de passe de l'utilisateur connecté
 * @param {string} oldPassword - L'ancien mot de passe
 * @param {string} newPassword - Le nouveau mot de passe
 */
export const changePassword = async (oldPassword, newPassword) => {
  try {
    const response = await api.post('/auth/change-password', {
      oldPassword,
      newPassword,
    });

    console.log('[changePassword] Succès:', response.data);
    return response.data; // { message: "Votre mot de passe a été modifié avec succès." }
  } catch (error) {
    console.error('[changePassword] Erreur:', error);
    if (error.response) {
      console.error('Détails de l’erreur:', error.response.data);
      // On propage l'erreur exacte du backend (ex: "L'ancien mot de passe est incorrect")
      throw error.response.data; 
    }
    throw error;
  }
};
/**
 * 🔹 Inscription Candidat — STEP 1
 * Création du User après validation du reçu
 * @param {Object} userData
 *//**
 * 🔹 Récupérer le profil utilisateur (Utile pour Google Auth)
 * Permet de récupérer nom, prénom, id, etc., à partir du token JWT
 */
export const getUserProfile = async () => {
  try {
    const response = await api.get('/auth/profile');
    console.log('[getUserProfile] Profil récupéré:', response.data);
    return response.data;
  } catch (error) {
    console.error('[getUserProfile] Erreur:', error);
    throw error;
  }
};
export const registerCandidateStep1 = async (userData) => {
  try {
    const response = await api.post(
      '/auth/register-candidate-step1',
      userData
    );
    console.log('[registerCandidateStep1] Réponse API:', response.data);
    return response.data; // { message, user }
  } catch (error) {
    console.error('[registerCandidateStep1] Erreur:', error);
    if (error.response) {
      console.error('Détails de l’erreur:', error.response.data);
    }
    throw error;
  }
};

/**
 * 🔹 Inscription Candidat — STEP 2
 * Complétion du profil candidat
 * @param {string} userId
 * @param {Object} step2Data
 */
/**
 * 🔹 Inscription Candidat — STEP 2
 * Complétion du profil candidat
 * @param {Object} payload - { userId, data }
 */
export const registerCandidateStep2 = async (payload) => {
  try {
    console.log('[registerCandidateStep2] Payload envoyé:', payload);

    const response = await api.post(
      '/auth/register-candidate-step2',
      payload // ✅ Envoyer directement l'objet { userId, data }
    );

    console.log('[registerCandidateStep2] Réponse API:', response.data);
    return response.data;
  } catch (error) {
    console.error('[registerCandidateStep2] Erreur:', error);
    if (error.response) console.error('Détails:', error.response.data);
    throw error;
  }
};
export const loginWithGoogle = () => {
  const googleAuthUrl = `${api.defaults.baseURL}/auth/google`;
  window.location.assign(googleAuthUrl);
};
/**
 * 🔹 Authentification GitHub
 * Redirige l'utilisateur vers le backend pour initier le flux OAuth GitHub
 */
export const loginWithGithub = () => {
  const githubAuthUrl = `${api.defaults.baseURL}/auth/github`;
  window.location.assign(githubAuthUrl);
};
export const registerCandidateStep3 = async (step3Data) => {
  try {
    const candidateId = localStorage.getItem('candidateId');

    if (!candidateId) {
      throw new Error('Candidate ID introuvable. Reprenez l’inscription.');
    }

    const payload = {
      candidateId,
      ...step3Data,
    };

    console.log('[registerCandidateStep3] Payload envoyé:', payload);

    const response = await api.post(
      '/auth/register-candidate-step3',
      payload
    );

    console.log('[registerCandidateStep3] Réponse API:', response.data);
    return response.data;
  } catch (error) {
    console.error('[registerCandidateStep3] Erreur:', error);
    if (error.response) console.error('Détails:', error.response.data);
    throw error;
  }
};

export const registerCandidateStep4 = async (step4Data) => {
  try {
    console.log('[registerCandidateStep4] Payload envoyé:', step4Data);

    const response = await api.post('/auth/register-candidate-step4', step4Data);
    console.log('[registerCandidateStep4] Réponse API:', response.data);
    return response.data;
  } catch (error) {
    console.error('[registerCandidateStep4] Erreur:', error);
    if (error.response) console.error('Détails:', error.response.data);
    throw error;
  }
};


/**
 * 🔹 Connexion (Admin ou Candidat)
 * @param {string} email
 * @param {string} password
 * @param {'ADMIN'|'CANDIDATE'} userType
 */
export const loginUser = async ({ codeAdmin, password, numeroRecu, userType }) => {
  try {
    let payload = { userType };

    // ===================== LOGIQUE STAFF (ADMIN & SUPERADMIN) =====================
    if (userType === 'ADMIN' || userType === 'SUPERADMIN') {
      // On utilise uniquement le codeAdmin pour les administrateurs
      payload.codeAdmin = codeAdmin; 
      payload.password = password;
    } 
    // ===================== LOGIQUE CANDIDAT =====================
    else if (userType === 'CANDIDATE') {
      payload.numeroRecu = numeroRecu;
      payload.password = password;
    }

    console.log(`[loginUser] Tentative de connexion ${userType} avec identifiant: ${codeAdmin || numeroRecu}`);

    const response = await api.post('/auth/login', payload);
    
    console.log('[loginUser] Réponse API:', response.data);
    return response.data;
  } catch (error) {
    console.error('[loginUser] Erreur:', error);
    if (error.response) {
      console.error('Détails:', error.response.data);
      throw error.response.data;
    }
    throw error;
  }
};


/**
 * 🔹 Inscription d’un Admin
 * @param {Object} adminData
 */
export const registerAdminUser = async (adminData) => {
  try {
    const response = await api.post(
      '/auth/register-admin',
      adminData
    );
    console.log('[registerAdminUser] Réponse API:', response.data);
    return response.data;
  } catch (error) {
    console.error('[registerAdminUser] Erreur:', error);
    if (error.response) {
      console.error('Détails de l’erreur:', error.response.data);
    }
    throw error;
  }
};
/**
 * 🔹 Récupérer tous les centres de dépôt
 */
export const getAllCentreDepot = async () => {
  try {
    const response = await api.get('/centre-depot');
    return response.data;
  } catch (error) {
    console.error('[getAllCentreDepot] Erreur:', error);
    throw error;
  }
};

/**
 * 🔹 Récupérer tous les centres d’examen
 */
export const getAllCentreExamen = async () => {
  try {
    const response = await api.get('/centre-examen');
    return response.data;
  } catch (error) {
    console.error('[getAllCentreExamen] Erreur:', error);
    throw error;
  }
};
/**
 * 🔹 Récupérer les infos complètes d’un candidat
 * @param {string} candidateId
 */
export const getCandidateInfo = async (candidateId) => {
  try {
    if (!candidateId) {
      throw new Error('Candidate ID requis pour récupérer les informations.');
    }

    const response = await api.get(`/auth/candidate-info/${candidateId}`);
    console.log('[getCandidateInfo] Réponse API:', response.data);
    return response.data; // renvoie l'objet candidat complet
  } catch (error) {
    console.error('[getCandidateInfo] Erreur:', error);
    if (error.response) {
      console.error('Détails de l’erreur:', error.response.data);
    }
    throw error;
  }
  
};

