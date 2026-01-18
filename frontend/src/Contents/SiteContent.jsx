import React from 'react';
import { Link } from 'react-router-dom'; // Nécessaire pour les liens internes

// --- IMPORTATION DES IMAGES D'ASSETS ---
// Assurez-vous que le chemin '../Assets/' est correct par rapport à ce composant.
import SiteImage1 from '../Assets/site1.png'; // Pour l'Inscription
import SiteImage2 from '../Assets/site2.png'; // Pour le Site Institutionnel
import SiteImage3 from '../Assets/site3.png'; // Pour l'Arrêté / Document clé

// --- CONSTANTES DE STYLES ---
const colorGreen = "#25963F";
const colorBlue = "#1E90FF"; 
const colorLightGray = "#f8f9fa"; // Gris très clair pour les sections secondaires

// Nouveau Style personnalisé pour les images principales (pour remplir la carte)
const imageStyleFullWidth = {
    width: '100%', // Prend toute la largeur de la carte
    height: 'auto',
    objectFit: 'cover',
    // Arrodissement des coins uniquement en haut
    borderTopLeftRadius: 'calc(0.5rem - 1px)', 
    borderTopRightRadius: 'calc(0.5rem - 1px)',
    marginBottom: '0', // Supprimer l'espace sous l'image
};


export default function SiteContent() {
  return (
    <>
    {/* SECTION PRINCIPALE - LIENS MAJEURS */}
    <section className="container py-5">
      
      <h1 className="text-center fw-bold mb-4" style={{ color: colorBlue }}>
        Accès Rapide à Nos Plateformes Officielles
      </h1>
      <p className="text-center lead mb-5 text-muted">
        Commencez votre inscription, consultez l'Arrêté ou découvrez l'univers de l'ESTLC en un clic.
      </p>

      <div className="row justify-content-center g-4">
        
        {/* CARTE 1 : Plateforme de Candidature (site1.png) */}
        <div className="col-lg-4 col-md-6">
          <div className="card h-100 shadow-lg border-0 rounded-4 border-top border-5" style={{ borderColor: colorGreen }}>
            
            {/* L'IMAGE PREND TOUTE LA LARGEUR EN HAUT */}
            <img 
              src={SiteImage1} 
              className="card-img-top" // Assure l'arrondi en haut
              alt="Capture d'écran de la plateforme d'inscription" 
              style={imageStyleFullWidth}
            />
            
            {/* LE TEXTE EST PLACÉ EN BAS (card-body) */}
            <div className="card-body p-4 text-center">
              <h2 className="card-title fw-bold mb-3" style={{ color: colorGreen, fontSize: '1.4rem' }}>
                Inscription au Concours
              </h2>
              <p className="card-text text-muted">
                Démarrez, reprenez ou complétez votre dossier de candidature.
              </p>
              
              <div className="mt-4">
                <Link 
                  to="/inscription" 
                  className="btn btn-sm fw-bold text-white shadow-sm px-4" 
                  style={{ backgroundColor: colorGreen, borderRadius: "8px" }}
                >
                  Accéder à l'Inscription
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* CARTE 2 : Arrêté de Lancement (site3.png) */}
        <div className="col-lg-4 col-md-6">
          <div className="card h-100 shadow-lg border-0 rounded-4 border-top border-5" style={{ borderColor: '#FFC107' }}>
              
            {/* L'IMAGE PREND TOUTE LA LARGEUR EN HAUT */}
            <img 
              src={SiteImage3} 
              className="card-img-top" // Assure l'arrondi en haut
              alt="Icône de document PDF" 
              style={imageStyleFullWidth}
            />

            {/* LE TEXTE EST PLACÉ EN BAS (card-body) */}
            <div className="card-body p-4 text-center">
              <h2 className="card-title fw-bold mb-3" style={{ color: '#FFC107', fontSize: '1.4rem' }}>
                Arrêté de Lancement
              </h2>
              <p className="card-text text-muted">
                Téléchargez le document officiel détaillant les conditions et places.
              </p>
              
              <div className="mt-4">
                <a 
                  href="/chemin/vers/arrete-lancement.pdf" 
                  download 
                  className="btn btn-sm fw-bold text-dark shadow-sm px-4"
                  style={{ backgroundColor: '#FFC107', borderRadius: "8px" }}
                >
                  <i className="fas fa-download me-2"></i> Télécharger
                </a>
              </div>
            </div>
          </div>
        </div>


        {/* CARTE 3 : Site Institutionnel (site2.png) */}
        <div className="col-lg-4 col-md-6">
          <div className="card h-100 shadow-lg border-0 rounded-4 border-top border-5" style={{ borderColor: colorBlue }}>
              
            {/* L'IMAGE PREND TOUTE LA LARGEUR EN HAUT */}
            <img 
              src={SiteImage2} 
              className="card-img-top" // Assure l'arrondi en haut
              alt="Capture d'écran du site web institutionnel" 
              style={imageStyleFullWidth}
            />

            {/* LE TEXTE EST PLACÉ EN BAS (card-body) */}
            <div className="card-body p-4 text-center">
              <h2 className="card-title fw-bold mb-3" style={{ color: colorBlue, fontSize: '1.4rem' }}>
                Site Web Institutionnel
              </h2>
              <p className="card-text text-muted">
                Découvrez en détail l'École, nos programmes et la vie étudiante.
              </p>
              
              <div className="mt-4">
                <a 
                  href="https://votre-site-institutionnel.com" // REMPLACEZ CETTE URL
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-sm fw-bold text-white shadow-sm px-4"
                  style={{ backgroundColor: colorBlue, borderRadius: "8px" }}
                >
                  Visiter le Site Officiel
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* SECTION SECONDAIRE - AUTRES RESSOURCES (Inchangée) */}
    <section className="container-fluid py-5" style={{ backgroundColor: colorLightGray }}>
      <div className="container">
        <h2 className="text-center fw-bold mb-4" style={{ color: colorGreen }}>
          Autres Documents & Ressources
        </h2>
        <p className="text-center lead mb-5 text-muted">
          Informations complémentaires et liens utiles.
        </p>

        <div className="row justify-content-center g-3">
            
            {/* Lien 2 : Guide du Candidat */}
            <div className="col-md-5">
                <a href="/chemin/vers/guide-candidat.pdf" download className="card card-link-hover h-100 border-0 shadow-sm rounded-3 text-decoration-none">
                    <div className="card-body d-flex align-items-center p-3">
                        <i className="fas fa-book fa-3x me-3" style={{ color: colorBlue }}></i>
                        <div>
                            <h5 className="card-title fw-bold mb-0 text-dark">Guide Complet du Candidat</h5>
                            <small className="text-muted">Format PDF - FAQ, étapes d'inscription détaillées.</small>
                        </div>
                    </div>
                </a>
            </div>
            
            {/* Nouveau lien (Exemple) */}
            <div className="col-md-5">
                <a href="/chemin/vers/filières.pdf" download className="card card-link-hover h-100 border-0 shadow-sm rounded-3 text-decoration-none">
                    <div className="card-body d-flex align-items-center p-3">
                        <i className="fas fa-graduation-cap fa-3x me-3" style={{ color: colorGreen }}></i>
                        <div>
                            <h5 className="card-title fw-bold mb-0 text-dark">Détail des Filières Disponibles</h5>
                            <small className="text-muted">Format PDF - Découvrez nos spécialités.</small>
                        </div>
                    </div>
                </a>
            </div>

        </div>
      </div>
    </section>

    {/* SECTION TERTIAIRE - CONTACT ET RÉSEAUX SOCIAUX (Inchangée) */}
    <section className="container py-5 text-center">
        <h2 className="fw-bold mb-4" style={{ color: colorBlue }}>
            Restez Connecté
        </h2>

        <div className="row justify-content-center">
            {/* Contact CTA */}
            <div className="col-md-6 mb-4">
                <div className="p-4 rounded-3 border h-100">
                    <p className="lead fw-bold">Vous avez des questions spécifiques ?</p>
                    <Link to="/contact" className="btn btn-outline-primary fw-bold" style={{ borderColor: colorGreen, color: colorGreen }}>
                        <i className="fas fa-headset me-2"></i> Contacter le Support
                    </Link>
                </div>
            </div>

            {/* Réseaux Sociaux */}
            <div className="col-md-6 mb-4">
                <div className="p-4 rounded-3 border h-100">
                    <p className="lead fw-bold">Suivez-nous sur les réseaux !</p>
                    <div className="d-flex justify-content-center gap-4">
                        <a href="https://facebook.com/ESTLC" target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                            <i className="fab fa-facebook fa-2x" style={{ color: '#3b5998' }}></i>
                        </a>
                        <a href="https://twitter.com/ESTLC" target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                            <i className="fab fa-twitter fa-2x" style={{ color: '#00acee' }}></i>
                        </a>
                        <a href="https://linkedin.com/school/ESTLC" target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                            <i className="fab fa-linkedin fa-2x" style={{ color: '#0e76a8' }}></i>
                        </a>
                    </div>
                </div>
            </div>
        </div>

        <div className="text-center mt-5 pt-3">
          <p className="text-muted fst-italic">
            Tous les liens sont vérifiés et maintenus par l'administration ESTLC.
          </p>
        </div>
        
    </section>
    </>
  );
}