import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Region } from '../models/user';
import { registerCandidateStep1 } from '../services/authService';

import Header from './Header';
import Footer from './Footer';

export default function Step1Register() {
  const location = useLocation();
  const navigate = useNavigate();

  const { numeroRecu, paiementInfo } = location.state || {};

  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [region, setRegion] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(null);

  useEffect(() => {
    if (paiementInfo) {
      setNom(paiementInfo.nom || '');
      setPrenom(paiementInfo.prenom || '');
      setEmail(paiementInfo.email || '');
      setTelephone(paiementInfo.telephone || '');
    }
  }, [paiementInfo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!nom || !prenom || !email || !telephone || !region) {
      setError('Veuillez remplir tous les champs.');
      setLoading(false);
      return;
    }

    const userData = { nom, prenom, email, password, telephone, region };

    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); 
      const result = await registerCandidateStep1(userData);
      
      localStorage.setItem('userId', result.user.id);

      navigate('/Step2Register', {
        state: { userId: result.user.id },
      });

    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l’inscription.');
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="container mt-5 text-center d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
        <div className="card shadow-lg p-5 border-0">
          <h2 className='mb-4 text-primary fw-bold'>Création de votre compte...</h2>
          <div className="spinner-border text-primary" style={{ width: '4rem', height: '4rem' }} role="status">
            <span className="visually-hidden">Enregistrement...</span>
          </div>
          <p className="mt-4 lead text-muted">Veuillez patienter pendant la création de votre profil.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />

      <div className="container d-flex justify-content-center align-items-center my-5" style={{ minHeight: '80vh' }}>
        <div className="card p-4 shadow-lg border-0" style={{ width: '100%', maxWidth: '550px' }}>
          
          {/* Section Barre de Progression Ajoutée */}
          <div className="text-center mb-4">
            <h3 className="text-primary fw-bold">
              <i className="bi bi-file-earmark-person me-2"></i> Étape 1/4
            </h3>
            <p className="text-muted small">Informations de compte</p>
            <div className="progress" style={{ height: '8px' }}>
              <div className="progress-bar bg-primary" role="progressbar" style={{ width: '25%' }}></div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold small"><i className="bi bi-person-fill me-2"></i>Nom</label>
                <input type="text" className="form-control" value={nom} onChange={(e) => setNom(e.target.value)} required />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold small"><i className="bi bi-person-fill me-2"></i>Prénom</label>
                <input type="text" className="form-control" value={prenom} onChange={(e) => setPrenom(e.target.value)} required />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold small"><i className="bi bi-envelope-fill me-2"></i>Email</label>
              <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold small"><i className="bi bi-lock-fill me-2"></i>Mot de passe</label>
              <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            <div className="row">
                <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold small"><i className="bi bi-phone-fill me-2"></i>Téléphone</label>
                    <input type="text" className="form-control" value={telephone} onChange={(e) => setTelephone(e.target.value)} required />
                </div>
                <div className="col-md-6 mb-4">
                    <label className="form-label fw-bold small"><i className="bi bi-map-fill me-2"></i>Région</label>
                    <select className="form-select" value={region} onChange={(e) => setRegion(e.target.value)} required>
                        <option value="">-- Choisir --</option>
                        {Object.values(Region).map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
            </div>

            <button type="submit" className="btn btn-primary w-100 btn-lg shadow-sm fw-bold" disabled={loading}>
              Suivant <i className="bi bi-arrow-right ms-2"></i>
            </button>

            {error && (
              <div className="alert alert-danger mt-3 text-center small animate__animated animate__shakeX">
                <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
              </div>
            )}
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}