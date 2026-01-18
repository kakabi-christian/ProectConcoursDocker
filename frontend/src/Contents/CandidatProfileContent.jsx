import React from 'react';
import { User, Mail, MapPin, Calendar, Phone, Award, CheckCircle, Briefcase } from 'lucide-react';

const colorBlue = '#1E90FF';
const colorGreen = '#25963F';

export default function CandidatProfileContent() {
  // Récupération des données (Simulation ou localStorage)
  const user = JSON.parse(localStorage.getItem('user')) || {
    nom: 'Nom',
    prenom: 'Prénom',
    email: 'candidat@polytech.cm',
    userType: 'CANDIDAT'
  };

  return (
    <div className="container-fluid py-4 animate__animated animate__fadeIn">
      <div className="row g-4">
        
        {/* COLONNE GAUCHE : IDENTITÉ */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 text-center p-4 h-100">
            <div className="position-relative d-inline-block mx-auto mb-3">
              <div 
                className="rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                style={{ width: '120px', height: '120px', backgroundColor: `${colorBlue}10`, border: `3px solid ${colorBlue}` }}
              >
                <User size={60} color={colorBlue} />
              </div>
              <span 
                className="position-absolute bottom-0 end-0 badge rounded-pill border border-white p-2"
                style={{ backgroundColor: colorGreen }}
              >
                <CheckCircle size={14} color="white" />
              </span>
            </div>
            <h4 className="fw-bold mb-1">{user.prenom} {user.nom}</h4>
            <p className="text-muted small text-uppercase fw-bold mb-3" style={{ letterSpacing: '1px' }}>
              {user.userType}
            </p>
            
            <hr className="my-4 opacity-50" />
            
            <div className="text-start">
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="p-2 rounded-3" style={{ backgroundColor: '#f8f9fa' }}><Mail size={18} color={colorBlue} /></div>
                <div><small className="text-muted d-block">Email</small><strong>{user.email}</strong></div>
              </div>
              <div className="d-flex align-items-center gap-3">
                <div className="p-2 rounded-3" style={{ backgroundColor: '#f8f9fa' }}><Phone size={18} color={colorBlue} /></div>
                <div><small className="text-muted d-block">Téléphone</small><strong>+237 6xx xxx xxx</strong></div>
              </div>
            </div>
          </div>
        </div>

        {/* COLONNE DROITE : DÉTAILS DU DOSSIER */}
        <div className="col-lg-8">
          <div className="row g-4">
            
            {/* CARTE STATUT */}
            <div className="col-12">
              <div className="card border-0 shadow-sm rounded-4 p-4 overflow-hidden position-relative">
                <div className="position-absolute end-0 top-0 p-3 opacity-10">
                  <Award size={100} color={colorBlue} />
                </div>
                <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                  <Briefcase size={20} color={colorBlue} /> État de la Candidature
                </h5>
                <div className="d-flex align-items-center gap-3 p-3 rounded-4" style={{ backgroundColor: `${colorGreen}10`, border: `1px dashed ${colorGreen}` }}>
                  <div className="bg-white p-2 rounded-circle shadow-sm"><CheckCircle color={colorGreen} /></div>
                  <div>
                    <h6 className="mb-0 fw-bold text-dark">Dossier Complet</h6>
                    <small className="text-muted">Votre candidature pour le concours est en cours de traitement.</small>
                  </div>
                </div>
              </div>
            </div>

            {/* CARTE INFOS SUPPLÉMENTAIRES */}
            <div className="col-12">
              <div className="card border-0 shadow-sm rounded-4 p-4">
                <h5 className="fw-bold mb-4">Informations Générales</h5>
                <div className="row g-4">
                  <div className="col-md-6 d-flex gap-3">
                    <Calendar size={20} color={colorBlue} />
                    <div><small className="text-muted d-block">Date de Naissance</small><strong>12 Octobre 2002</strong></div>
                  </div>
                  <div className="col-md-6 d-flex gap-3">
                    <MapPin size={20} color={colorBlue} />
                    <div><small className="text-muted d-block">Lieu de Naissance</small><strong>Maroua, Cameroun</strong></div>
                  </div>
                  <div className="col-md-6 d-flex gap-3">
                    <Award size={20} color={colorBlue} />
                    <div><small className="text-muted d-block">Spécialité Choisie</small><strong>Génie Informatique</strong></div>
                  </div>
                  <div className="col-md-6 d-flex gap-3">
                    <MapPin size={20} color={colorBlue} />
                    <div><small className="text-muted d-block">Ville Résidence</small><strong>Douala</strong></div>
                  </div>
                </div>
              </div>
            </div>

            {/* BOUTON MODIFIER */}
            <div className="col-12 text-end">
              <button 
                className="btn px-4 py-2 rounded-pill fw-bold text-white shadow-sm"
                style={{ backgroundColor: colorBlue, border: 'none' }}
              >
                Modifier mes informations
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}