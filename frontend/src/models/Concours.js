/**
 * Structure d'un objet Concours (Modèle de données Frontend)
 */
export const Concours = {
    id: '',
    code: '',      // Unique (ex: "SAGE2024")
    intitule: '',  // Nom complet
    montant: 0,    // Frais d'inscription
    
    // --- GESTION DU STATUT ET DES DATES ---
    // Statuts possibles: 'PLANIFIE', 'OUVERT', 'FERME', 'TERMINE'
    statut: 'PLANIFIE', 
    dateDebutInscription: null,
    dateFinInscription: null,

    // --- RELATIONS (IDs pour les formulaires) ---
    anneeId: '',
    sessionId: '',
    pieceDossierIds: [], // Liste d'IDs pour le multi-select (Create/Update)

    // --- OBJETS INCLUS (Retournés par le Backend via Prisma include) ---
    annee: null,          // Objet Année complet
    session: null,        // Objet Session complet
    piecesDossier: [],    // Tableau d'objets PieceDossier complets
    
    // Statistiques (optionnel, renvoyé par _count dans ton service)
    _count: {
        enrollements: 0
    },

    createdAt: '',
    updatedAt: '',
};

/**
 * Liste des statuts pour tes composants UI (Select, Badges)
 */
export const CONCOURS_STATUS = {
    PLANIFIE: { label: 'Planifié', color: 'secondary' },
    OUVERT: { label: 'Ouvert', color: 'success' },
    FERME: { label: 'Fermé', color: 'danger' },
    TERMINE: { label: 'Terminé', color: 'dark' }
};

/**
 * Structure de la réponse paginée du Backend
 */
export const ConcoursPagination = {
    data: [],
    pagination: {
        total: 0,
        page: 1,
        lastPage: 1,
        hasNextPage: false,
        hasPreviousPage: false
    }
};