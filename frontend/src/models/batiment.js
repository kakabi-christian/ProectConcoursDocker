/**
 * Structure d'un objet Bâtiment
 */
export const Batiment = {
    id: "",
    nom: "",
    code: "", // ex: "CF", "CG"
    salles: [], // Liste des salles rattachées
    _count: {
        salles: 0
    },
    createdAt: null,
    updatedAt: null
};

/**
 * Structure de la réponse paginée venant du Backend NestJS
 */
export const BatimentResponse = {
    data: [], // Tableau de Batiment
    meta: {
        total: 0,
        page: 1,
        lastPage: 1
    }
};