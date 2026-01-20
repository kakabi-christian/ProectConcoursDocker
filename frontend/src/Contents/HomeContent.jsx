import React from "react";
import Image1 from "../Assets/Images1.png";
import Image2 from "../Assets/Images2.png";
import "../Styles/HomeContent.css"; // Assurez-vous que ce chemin est correct

const colorGreen = "#25963F";
const colorBlue = "#1E90FF";
const colorLightGray = "#f8f9fa"; // Arrière-plan pour les statistiques

export default function HomeContent() {
  return (
    <React.Fragment>
      {/* SECTION PRINCIPALE */}
      <div className="container mt-5">
        <div className="row align-items-center">
          {/* LEFT TEXT SECTION */}
          <div className="col-md-6">
            <h1 className="fw-bold" style={{ lineHeight: "1.2", fontSize:'30px' }}>
              Bienvenue sur notre<br />
              Plateforme de  Système de Gestion d’Enrôlement des Étudiants

            </h1>

            <p className="mt-1">
              Nous vous recommandons de télécharger l’arrêté de lancement du concours qui
              pourra être utile plus tard. Faites-le en cliquant sur le bouton suivant en
              fonction de votre niveau.
            </p>

            {/* BUTTONS (RESTAURÉS SELON LA DEMANDE INITIALE) */}
            <div className="d-flex gap-3 mt-3">
              <button
                className="btn fw-bold px-4 py-2 text-white"
                style={{ backgroundColor: colorGreen, borderRadius: "8px" }}
              >
                Première Année
              </button>

              <button
                className="btn fw-bold px-4 py-2 text-white"
                style={{ backgroundColor: colorGreen, borderRadius: "8px" }}
              >
                Troisième Année
              </button>
            </div>
            
            <p className="mt-3">
              Veuillez remplir toutes les informations nécessaires pour le concours
              d’entrée dans nos Écoles. Si vous avez des requêtes, cliquez sur le bouton
              correspondant à votre niveau.
            </p>
            
            {/* J'ajoute un bouton d'appel à l'action clair pour commencer l'inscription/la requête,
                car les boutons ci-dessus servent au téléchargement de l'arrêté. */}
            <div className="mt-2">
                <a
                    href="/inscription" // Remplacez par le chemin de votre formulaire d'inscription
                    className="btn fw-bold px-5 py-3 text-white text-decoration-none shadow-lg"
                    style={{ backgroundColor: colorBlue, borderRadius: "8px", fontSize: "1.1rem" }}
                >
                    Commencer l'Inscription / Faire une Requête
                </a>
            </div>

          </div>

          {/* RIGHT CAROUSEL (EXISTANT) */}
          <div className="col-md-6 mt-4 mt-md-0">
            <div
              id="homeCarousel"
              className="carousel slide"
              data-bs-ride="carousel"
            >
              <div className="carousel-inner rounded shadow-lg">
                <div className="carousel-item active">
                  <img src={Image1} className="d-block w-100" alt="étudiants 1" />
                </div>
                <div className="carousel-item">
                  <img src={Image2} className="d-block w-100" alt="étudiants 2" />
                </div>
              </div>

              {/* Controls */}
              <button
                className="carousel-control-prev"
                type="button"
                data-bs-target="#homeCarousel"
                data-bs-slide="prev"
              >
                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Précédent</span>
              </button>
              <button
                className="carousel-control-next"
                type="button"
                data-bs-target="#homeCarousel"
                data-bs-slide="next"
              >
                <span className="carousel-control-next-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Suivant</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- SECTION: STATISTIQUES CLÉS (CONSERVÉE) --- */}
      <div className="container-fluid mt-5 py-5" style={{ backgroundColor: colorLightGray }}>
        <div className="container">
          <h2 className="text-center fw-bold mb-5" style={{ color: colorBlue }}>
            Concours ESTLC en Chiffres
          </h2>
          <div className="row text-center">
            {/* Statistique 1: Inscriptions */}
            <div className="col-md-4 mb-4">
              <div className="p-4 bg-white rounded shadow-sm">
                <h3 className="display-4 fw-bold" style={{ color: colorGreen }}>5200+</h3>
                <p className="lead text-muted">Candidats inscrits (Total)</p>
              </div>
            </div>
            {/* Statistique 2: Places Offertes */}
            <div className="col-md-4 mb-4">
              <div className="p-4 bg-white rounded shadow-sm">
                <h3 className="display-4 fw-bold" style={{ color: colorGreen }}>450</h3>
                <p className="lead text-muted">Places Offertes (Total)</p>
              </div>
            </div>
            {/* Statistique 3: Filières */}
            <div className="col-md-4 mb-4">
              <div className="p-4 bg-white rounded shadow-sm">
                <h3 className="display-4 fw-bold" style={{ color: colorGreen }}>12</h3>
                <p className="lead text-muted">Filières Représentées</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- SECTION: ÉTAPES D'INSCRIPTION (CONSERVÉE) --- */}
      <div className="container my-5 py-5">
        <h2 className="text-center fw-bold mb-5" style={{ color: colorBlue }}>
          Comment s'inscrire en 3 Étapes Faciles
        </h2>
        
        <div className="row">
          {/* Étape 1 */}
          <div className="col-md-4 text-center mb-4">
            <div className="p-4 border rounded h-100">
              <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                   style={{ width: "60px", height: "60px", backgroundColor: colorGreen, color: "white", fontSize: "1.5rem" }}>
                1
              </div>
              <h4 className="fw-bold" style={{ color: colorGreen }}>Télécharger l'Arrêté</h4>
              <p className="text-muted">Consultez les conditions d'éligibilité et les pièces requises pour votre niveau.</p>
            </div>
          </div>
          {/* Étape 2 */}
          <div className="col-md-4 text-center mb-4">
            <div className="p-4 border rounded h-100">
              <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                   style={{ width: "60px", height: "60px", backgroundColor: colorGreen, color: "white", fontSize: "1.5rem" }}>
                2
              </div>
              <h4 className="fw-bold" style={{ color: colorGreen }}>Remplir le Formulaire</h4>
              <p className="text-muted">Renseignez toutes vos informations personnelles et académiques avec précision.</p>
            </div>
          </div>
          {/* Étape 3 */}
          <div className="col-md-4 text-center mb-4">
            <div className="p-4 border rounded h-100">
              <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                   style={{ width: "60px", height: "60px", backgroundColor: colorGreen, color: "white", fontSize: "1.5rem" }}>
                3
              </div>
              <h4 className="fw-bold" style={{ color: colorGreen }}>Valider & Paiement</h4>
              <p className="text-muted">Soumettez votre dossier et effectuez le paiement des frais de concours.</p>
            </div>
          </div>
        </div>
      </div>

    </React.Fragment>
  );
}