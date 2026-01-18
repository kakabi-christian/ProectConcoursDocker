/**
 * Structure d'un objet Salle
 */
export const Salle = {
    id: "",
    codeClasse: "", // Généré par le backend (ex: CF100)
    capacite: 50,   // Valeur par défaut
    batimentId: "", // Clé étrangère
    
    // Relation incluse via Prisma
    batiment: {
        id: "",
        nom: "",
        code: ""
    },
    
    createdAt: null,
    updatedAt: null
};

/**
 * Structure de la réponse paginée pour les Salles
 */
export const SallePagination = {
    data: [], // Tableau d'objets Salle
    meta: {
        total: 0,
        page: 1,
        lastPage: 1
    }
};

/**
 * Structure simplifiée pour le Select du bâtiment
 * Utilisée lors de la création d'une salle
 */
export const BatimentOption = {
    id: "",
    nom: "",
    code: ""
};