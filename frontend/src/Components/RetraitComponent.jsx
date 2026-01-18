import React, { useState } from 'react';
import { withdrawToAdmin } from '../services/paiementService';
import { 
  BiWallet, BiLockAlt, BiCheckCircle, BiErrorCircle, 
  BiLoaderAlt, BiArrowBack, BiTransferAlt 
} from 'react-icons/bi';

export default function RetraitComponent() {
  const [step, setStep] = useState('amount'); // amount | loading | password | success
  const [amount, setAmount] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 1. Passage à l'étape de chargement simulé
  const handleNextStep = (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) return;
    
    setStep('loading');
    // Simulation de préparation pendant 2 secondes
    setTimeout(() => {
      setStep('password');
    }, 2000);
  };

  // 2. Action finale de retrait vers le backend
  const handleFinalWithdraw = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await withdrawToAdmin(Number(amount), password);
      setStep('success');
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors du retrait. Vérifiez votre mot de passe.");
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid p-4 bg-light min-vh-100 d-flex align-items-center justify-content-center">
      <div className="card shadow border-0 rounded-4 overflow-hidden" style={{ maxWidth: '450px', width: '100%' }}>
        
        {/* HEADER (Même bleu que ton portail) */}
        <div className="bg-primary p-4 text-white text-center">
          <BiWallet className="mb-2" size={48} />
          <h3 className="fw-bold mb-1">Retrait de fonds</h3>
          <p className="small mb-0 opacity-75">Transfert sécurisé vers le compte Admin</p>
        </div>

        <div className="card-body p-4">
          
          {/* ÉTAPE 1 : MONTANT */}
          {step === 'amount' && (
            <form onSubmit={handleNextStep}>
              <div className="mb-4">
                <label className="form-label text-muted small fw-bold text-uppercase">Montant à retirer (XAF)</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-primary">
                    <BiTransferAlt />
                  </span>
                  <input
                    type="number"
                    required
                    placeholder="Ex: 50000"
                    className="form-control border-start-0 shadow-none fw-bold"
                    style={{ backgroundColor: '#f0f4f8', fontSize: '1.2rem' }}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-primary w-100 rounded-pill py-3 fw-bold shadow-sm"
              >
                Continuer
              </button>
            </form>
          )}

          {/* ÉTAPE 2 : CHARGEMENT (2s) */}
          {step === 'loading' && (
            <div className="text-center py-5">
              <BiLoaderAlt className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} />
              <p className="text-muted fw-semibold">Sécurisation de la connexion...</p>
            </div>
          )}

          {/* ÉTAPE 3 : MOT DE PASSE */}
          {step === 'password' && (
            <form onSubmit={handleFinalWithdraw}>
              <div className="alert alert-info border-0 rounded-3 mb-4 d-flex align-items-center">
                <BiTransferAlt className="me-2" size={20} />
                <span>Montant sélectionné : <strong>{amount} XAF</strong></span>
              </div>
              
              <div className="mb-4">
                <label className="form-label text-muted small fw-bold text-uppercase">Confirmation Admin</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-primary">
                    <BiLockAlt />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="Mot de passe admin"
                    className="form-control border-start-0 shadow-none"
                    style={{ backgroundColor: '#f0f4f8' }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <div className="text-danger small mb-3 d-flex align-items-center">
                  <BiErrorCircle className="me-1" /> {error}
                </div>
              )}

              <div className="d-flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('amount')}
                  className="btn btn-outline-secondary rounded-pill px-4"
                >
                  <BiArrowBack />
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary flex-grow-1 rounded-pill fw-bold"
                >
                  {loading ? <BiLoaderAlt className="spinner-border spinner-border-sm" /> : "Valider le retrait"}
                </button>
              </div>
            </form>
          )}

          {/* ÉTAPE 4 : SUCCÈS */}
          {step === 'success' && (
            <div className="text-center py-4">
              <div className="bg-success-subtle text-success rounded-circle d-inline-flex p-3 mb-3">
                <BiCheckCircle size={50} />
              </div>
              <h4 className="fw-bold">Retrait lancé !</h4>
              <p className="text-muted small">L'argent sera transféré sur votre numéro de téléphone d'ici quelques instants.</p>
              <button
                onClick={() => { setStep('amount'); setAmount(''); setPassword(''); }}
                className="btn btn-link text-primary text-decoration-none fw-bold"
              >
                Effectuer un autre retrait
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}