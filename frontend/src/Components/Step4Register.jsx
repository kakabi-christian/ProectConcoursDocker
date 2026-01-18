import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllCentreDepot, getAllCentreExamen, registerCandidateStep4 } from '../services/authService';
import Header from './Header';
import Footer from './Footer';

export default function Step4Register() {
  const [centreDepotList, setCentreDepotList] = useState([]);
  const [centreExamenList, setCentreExamenList] = useState([]);
  const [centreDepotId, setCentreDepotId] = useState('');
  const [centreExamenId, setCentreExamenId] = useState('');
  
  const [loading, setLoading] = useState(false); 
  const [message, setMessage] = useState('');

  // Récupération de l'ID candidat
  const candidateId = localStorage.getItem('candidateId');
  const navigate = useNavigate();

  // 🔹 Chargement des centres au montage du composant
  useEffect(() => {
    const fetchCentres = async () => {
      try {
        const resDepots = await getAllCentreDepot();
        const resExamens = await getAllCentreExamen();
        
        // Adaptation aux réponses paginées (res.data.data) ou simples (res.data)
        const depots = resDepots.data?.data || resDepots.data || resDepots;
        const examens = resExamens.data?.data || resExamens.data || resExamens;

        setCentreDepotList(Array.isArray(depots) ? depots : []);
        setCentreExamenList(Array.isArray(examens) ? examens : []);
      } catch (error) {
        console.error('Erreur récupération centres:', error);
        setMessage('Erreur technique lors de la récupération des centres.');
      }
    };

    fetchCentres();
  }, []);

  // 🔴 Sécurité : Vérification de la session
  if (!candidateId && !loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="alert alert-danger shadow-sm border-0">
          <h4 className="fw-bold">Session expirée</h4>
          <p>L'identifiant de votre dossier est introuvable. Veuillez recommencer depuis l'étape 1.</p>
          <button className="btn btn-danger" onClick={() => navigate('/Register')}>Recommencer</button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!centreDepotId || !centreExamenId) {
      setMessage('Veuillez sélectionner un centre de dépôt et un centre d’examen.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Délai esthétique
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await registerCandidateStep4({
        candidateId,
        centreDepotId,
        centreExamenId,
      });

      // ✅ Succès : Nettoyage du localStorage pour éviter les conflits lors d'une future inscription
      localStorage.removeItem('userId');
      localStorage.removeItem('candidateId'); 

      // Navigation vers la page finale avec l'ID en paramètre URL
      navigate(`/CandidateInfo?candidateId=${candidateId}`);
    } catch (error) {
      console.error('Erreur inscription étape 4:', error);
      setMessage(error.response?.data?.message || 'Une erreur est survenue lors de la finalisation.');
    } finally {
      setLoading(false);
    }
  };

  // --- Animation de chargement final ---
  if (loading) {
    return (
      <div className="container mt-5 text-center d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
        <div className="card shadow-lg p-5 border-0">
          <h2 className='mb-4 text-primary fw-bold'>Finalisation de votre dossier...</h2>
          <div className="spinner-grow text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-4 lead text-muted">Nous enregistrons vos préférences géographiques.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />

      <div className="container d-flex justify-content-center align-items-center my-5" style={{ minHeight: '75vh' }}>
        <div className="card p-4 shadow-lg border-0" style={{ width: '100%', maxWidth: '600px' }}>
          
          <div className="text-center mb-4">
            <h3 className="text-primary fw-bold">
              <i className="bi bi-geo-alt-fill me-2"></i> Étape 4/4 : Centres
            </h3>
            <div className="progress mt-3" style={{ height: '8px' }}>
              <div className="progress-bar bg-primary" role="progressbar" style={{ width: '100%' }}></div>
            </div>
            <p className="mt-2 text-muted small">Dernière étape avant la confirmation</p>
          </div>

          {message && (
            <div className="alert alert-danger text-center animate__animated animate__shakeX">
              <i className="bi bi-exclamation-triangle-fill me-2"></i> {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Centre de dépôt */}
            <div className="mb-4">
              <label className="form-label fw-bold small text-secondary">
                <i className="bi bi-pin-map-fill me-2"></i> CENTRE DE DÉPÔT DES DOSSIERS
              </label>
              <select
                className="form-select form-select-lg shadow-sm border-primary"
                value={centreDepotId}
                onChange={(e) => setCentreDepotId(e.target.value)}
                required
              >
                <option value="">-- Choisir un centre --</option>
                {centreDepotList.map((centre) => (
                  <option key={centre.id} value={centre.id}>
                    {centre.intitule} {centre.lieuDepot ? `(${centre.lieuDepot})` : ''}
                  </option>
                ))}
              </select>
              <div className="form-text mt-1 small">Lieu où vous déposerez vos documents physiques.</div>
            </div>

            {/* Centre d’examen */}
            <div className="mb-4">
              <label className="form-label fw-bold small text-secondary">
                <i className="bi bi-building me-2"></i> CENTRE DE COMPOSITION (EXAMEN)
              </label>
              <select
                className="form-select form-select-lg shadow-sm border-primary"
                value={centreExamenId}
                onChange={(e) => setCentreExamenId(e.target.value)}
                required
              >
                <option value="">-- Choisir un centre --</option>
                {centreExamenList.map((centre) => (
                  <option key={centre.id} value={centre.id}>
                    {centre.intitule} {centre.lieuCentre ? `(${centre.lieuCentre})` : ''}
                  </option>
                ))}
              </select>
              <div className="form-text mt-1 small">Lieu où vous passerez les épreuves écrites.</div>
            </div>

            <hr className="my-4" />

            <button 
              type="submit" 
              className="btn btn-success w-100 btn-lg shadow fw-bold" 
              disabled={loading}
            >
              <i className="bi bi-check-circle-fill me-2"></i> VALIDER MON INSCRIPTION
            </button>
          </form>
        </div>
      </div>
      
      <Footer />
    </>
  );
}