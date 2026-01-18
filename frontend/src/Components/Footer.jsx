import React from 'react';
// Les imports sont corrects !
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaHome, FaEnvelope, FaPhone } from 'react-icons/fa';

const colorGreen = "#25963F";
const colorBlue = "#1E90FF";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="text-white pt-5" style={{ backgroundColor: 'black' }}>
      <div className="container">
        <div className="row">
          
          {/* Section 1: À propos / Nom de la plateforme */}
          <div className="col-md-4 mb-4">
            <h5 className="text-uppercase fw-bold mb-3" style={{ color: colorGreen }}>
              ESTLC Concours
            </h5>
            <p>
              Votre plateforme officielle d'inscription aux concours d'entrée. 
              Simplifiez vos démarches et accédez à l'excellence académique.
            </p>
          </div>

          {/* Section 2: Liens Utiles */}
          <div className="col-md-3 mb-4">
            <h5 className="text-uppercase fw-bold mb-3" style={{ color: colorGreen }}>
              Liens Rapides
            </h5>
            <ul className="list-unstyled">
              <li><a href="/inscription" className="text-white text-decoration-none">Inscription</a></li>
              <li><a href="/faq" className="text-white text-decoration-none">FAQ</a></li>
              <li><a href="/contact" className="text-white text-decoration-none">Contact / Support</a></li>
              <li><a href="/arretes" className="text-white text-decoration-none">Téléchargements</a></li>
            </ul>
          </div>

          {/* Section 3: Contact (CORRIGÉE : Utilisation de FaHome, FaEnvelope, FaPhone) */}
          <div className="col-md-5 mb-4">
            <h5 className="text-uppercase fw-bold mb-3" style={{ color: colorGreen }}>
              Contact
            </h5>
            <p><FaHome className="me-3" /> [Adresse Physique de l'École]</p>
            <p><FaEnvelope className="me-3" /> contact@estlc.edu</p>
            <p><FaPhone className="me-3" /> +237 685 85 65 52</p>
          </div>

        </div>
        
        <hr className="mb-4" style={{ borderColor: colorGreen }} />

        {/* Ligne du bas : Copyright et Réseaux Sociaux */}
        <div className="row d-flex align-items-center">
          
          {/* Copyright */}
          <div className="col-md-7 col-lg-8 text-md-start mb-3 mb-md-0">
            <p className="text-center text-md-start">
              © {currentYear} Copyright: 
              <a className="text-white fw-bold ms-1 text-decoration-none" href="#">ESTLC</a>. Tous droits réservés.
            </p>
          </div>

          {/* Réseaux Sociaux (CORRIGÉE : Utilisation de FaFacebookF, FaTwitter, etc.) */}
          <div className="col-md-5 col-lg-4">
            <div className="text-center text-md-end">
              <a href="[Lien Facebook]" className="text-white me-4" target="_blank" rel="noopener noreferrer">
                <FaFacebookF size={20} />
              </a>
              <a href="[Lien Twitter]" className="text-white me-4" target="_blank" rel="noopener noreferrer">
                <FaTwitter size={20} />
              </a>
              <a href="[Lien Instagram]" className="text-white me-4" target="_blank" rel="noopener noreferrer">
                <FaInstagram size={20} />
              </a>
              <a href="[Lien LinkedIn]" className="text-white" target="_blank" rel="noopener noreferrer">
                <FaLinkedinIn size={20} />
              </a>
            </div>
          </div>

        </div>
      </div>
      
      <div className="text-center p-3 mt-3" style={{ backgroundColor:colorBlue }}>
      </div>
      
    </footer>
  );
}