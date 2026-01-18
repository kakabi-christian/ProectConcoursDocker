import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { TypeBac, TypeMention } from '../models/documents';
import { registerCandidateStep3 } from '../services/authService';

export default function Step3Register() {
  const location = useLocation();
  const navigate = useNavigate();

  // --- États ---
  const [candidateId, setCandidateId] = useState(location.state?.candidateId || '');
  const [numeroCni, setNumeroCni] = useState('');
  const [typeExamen, setTypeExamen] = useState('');
  const [serie, setSerie] = useState('');
  const [mention, setMention] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🔹 Récupération sécurisée du candidateId (Persistance au rafraîchissement)
  useEffect(() => {
    if (!candidateId) {
      const storedId = localStorage.getItem('candidateId');
      if (storedId) {
        setCandidateId(storedId);
      }
    }
  }, [candidateId]);

  // 🔴 Sécurité : Redirection si l'ID est manquant
  if (!candidateId && !loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="alert alert-warning shadow-sm">
          <h4><i className="bi bi-exclamation-triangle me-2"></i> Session interrompue</h4>
          <p>Impossible de lier ces informations à un candidat. Veuillez recommencer l'inscription.</p>
          <button className="btn btn-warning mt-2" onClick={() => navigate('/Register')}>
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (!typeExamen || !mention) {
      setError('Le type d’examen et la mention sont obligatoires.');
      setLoading(false);
      return;
    }

    const step3Data = {
      candidateId,
      numeroCni: numeroCni.trim() || undefined,
      typeExamen,
      serie: serie.toUpperCase().trim() || undefined,
      Mention: mention, // Respecte la casse attendue par ton DTO NestJS
    };

    try {
      // Simulation esthétique du délai de traitement
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      await registerCandidateStep3(step3Data);

      // ✅ Navigation vers Step4 (souvent l'étape d'upload final ou de récapitulatif)
      navigate('/Step4Register', { state: { candidateId } });

    } catch (err) {
      console.error("Erreur Step 3:", err);
      setError(err.response?.data?.message || err.message || 'Erreur lors de l’enregistrement des informations académiques.');
    } finally {
      setLoading(false);
    }
  };
  
  // --- Écran de chargement ---
  if (loading) {
    return (
      <div className="container mt-5 text-center d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
        <div className="card shadow-lg p-5 border-0">
          <h2 className='mb-4 text-primary fw-bold'>Finalisation du profil...</h2>
          <div className="spinner-border text-primary" style={{ width: '4rem', height: '4rem' }} role="status">
            <span className="visually-hidden">Traitement...</span>
          </div>
          <p className="mt-4 lead text-muted">Nous préparons l'étape finale de votre inscription.</p>
        </div>
      </div>
    );
  }

  // --- Rendu Principal ---
  return (
    <>
      <Header />
      <div className="container d-flex justify-content-center align-items-center my-5" style={{ minHeight: '75vh' }}>
        <div className="card p-4 shadow-lg border-0" style={{ width: '100%', maxWidth: '550px' }}>
          
          <div className="text-center mb-4">
            <h3 className="text-primary fw-bold">
              <i className="bi bi-file-earmark-text-fill me-2"></i> Étape 3/4
            </h3>
            <p className="text-muted">Informations sur le diplôme</p>
            <div className="progress" style={{ height: '8px' }}>
              <div className="progress-bar bg-primary" role="progressbar" style={{ width: '75%' }}></div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Numéro CNI */}
            <div className="mb-3">
              <label className="form-label fw-bold small"><i className="bi bi-card-heading me-2"></i>Numéro CNI / Passeport</label>
              <input 
                type="text" 
                className="form-control form-control-lg" 
                value={numeroCni} 
                onChange={e => setNumeroCni(e.target.value)} 
                required
              />
            </div>

            <div className="row">
              {/* Type de BAC */}
              <div className="col-md-12 mb-3">
                <label className="form-label fw-bold small"><i className="bi bi-award-fill me-2"></i>Type d'Examen *</label>
                <select 
                  className="form-select form-select-lg" 
                  value={typeExamen} 
                  onChange={e => setTypeExamen(e.target.value)} 
                  required
                >
                  <option value="">-- Choisir le diplôme --</option>
                  {Object.values(TypeBac).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {/* Série */}
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold small">Série / Spécialité</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Ex: C, D, TI, GCE..." 
                  value={serie} 
                  onChange={e => setSerie(e.target.value)} 
                />
              </div>

              {/* Mention */}
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold small">Mention obtenue *</label>
                <select 
                  className="form-select" 
                  value={mention} 
                  onChange={e => setMention(e.target.value)} 
                  required
                >
                  <option value="">-- Choisir --</option>
                  {Object.values(TypeMention).map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>

            <hr className="my-4" />

            <button 
              type="submit" 
              className="btn btn-primary w-100 btn-lg shadow-sm" 
              disabled={loading}
            >
              Continuer vers l'étape finale <i className="bi bi-arrow-right ms-2"></i>
            </button>

            {error && (
              <div className="alert alert-danger mt-3 text-center small animate__animated animate__fadeIn">
                <i className="bi bi-exclamation-circle me-2"></i> {error}
              </div>
            )}
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}