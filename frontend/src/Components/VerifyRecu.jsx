import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyRecuForRegistration, getPaiementInfoByRecu } from '../services/paiementService';

export default function VerifyRecu() {
  const [numeroRecu, setNumeroRecu] = useState('');
  // MODIFIÉ: L'état de chargement servira aussi pour l'animation pleine page
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Simulation d'un délai pour l'animation (ex: 1.5 secondes)
      await new Promise(resolve => setTimeout(resolve,4000)); 

      // 1. Vérifie le reçu
      const recuData = await verifyRecuForRegistration(numeroRecu);
      console.log('[VerifyRecu] Reçu validé :', recuData);

      // 2. Récupère les infos du paiement pour pré-remplir Step1Register
      const paiementInfo = await getPaiementInfoByRecu(numeroRecu);
      console.log('[VerifyRecu] Infos paiement :', paiementInfo);

      // 3. Redirection vers Step1Register avec les infos
      navigate('/Step1Register', {
        state: { numeroRecu, paiementInfo },
      });

    } catch (err) {
      console.error('[VerifyRecu] Erreur :', err);
      setError(err.response?.data?.message || 'Erreur lors de la vérification du reçu ou le reçu est déjà utilisé.');
    } finally {
      // Le loading est coupé après la redirection, ou après l'erreur
      setLoading(false);
    }
  };
  
  // --- Rendu de l'état de traitement (Animation) ---
  if (loading) {
    return (
      <div className="container mt-5 text-center d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
        <h2 className='mb-4 text-primary'>Vérification du reçu en cours...</h2>
        {/* Animation de chargement Bootstrap */}
        <div className="spinner-grow text-primary" style={{ width: '4rem', height: '4rem' }} role="status">
          <span className="visually-hidden">Vérification...</span>
        </div>
        <p className="mt-4 lead text-muted">Veuillez patienter.</p>
      </div>
    );
  }

  // --- Rendu Principal ---
  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="card p-4 shadow-lg border-0" style={{ width: '100%', maxWidth: '450px', marginBottom: '5rem' }}>
        <h3 className="card-title mb-4 text-center text-primary fw-bold">
          <i className="bi bi-receipt-cutoff me-2"></i> Vérification du Reçu
        </h3>
        <p className="text-muted text-center mb-4">
          Entrez le numéro de reçu que vous avez obtenu après le paiement des frais de concours.
        </p>

        <form onSubmit={handleVerify}>
          <div className="mb-4">
            <label htmlFor="numeroRecu" className="form-label fw-medium">
              Numéro de reçu :
            </label>
            <input
              type="text"
              className="form-control form-control-lg"
              id="numeroRecu"
              value={numeroRecu}
              onChange={(e) => setNumeroRecu(e.target.value)}
              placeholder="Ex: REC-A1B2C3D4"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary w-100 btn-lg" 
            disabled={!numeroRecu || loading} // Désactivé si vide ou en chargement
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Vérification...
              </>
            ) : (
              'Vérifier le Reçu'
            )}
          </button>
        </form>
        
        {error && 
          <div className="alert alert-danger mt-4 text-center" role="alert">
            <i className="bi bi-x-octagon-fill me-2"></i>
            {error}
          </div>
        }
      </div>
    </div>
  );
}