// src/components/AccessDenied.jsx
import React from 'react';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AccessDenied = ({ message = "Vous n'avez pas les permissions nécessaires pour effectuer cette opération." }) => {
  const navigate = useNavigate();

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light p-3">
      <div className="card border-0 shadow-lg text-center p-5" style={{ borderRadius: '24px', maxWidth: '500px' }}>
        <div className="d-flex justify-content-center mb-4">
          <div className="bg-danger bg-opacity-10 p-4 rounded-circle">
            <ShieldAlert size={64} className="text-danger" />
          </div>
        </div>
        
        <h2 className="fw-bold text-dark mb-3">Accès Refusé</h2>
        
        <p className="text-muted mb-4 fs-5">
          {message}
        </p>

        <div className="d-flex flex-column gap-2">
          <button 
            onClick={() => navigate(-1)} 
            className="btn btn-dark py-2 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2"
          >
            <ArrowLeft size={18} /> Retour en arrière
          </button>
          
          <button 
            onClick={() => navigate('/dashboard')} 
            className="btn btn-outline-secondary py-2 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2"
          >
            <Home size={18} /> Accueil Dashboard
          </button>
        </div>

        <div className="mt-4 pt-4 border-top">
          <small className="text-secondary">
            Si vous pensez qu'il s'agit d'une erreur, contactez l'administrateur principal.
          </small>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;