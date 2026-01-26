// src/Contents/PaiementContent.jsx
import React, { useState, useEffect } from 'react';
import { getActiveConcours } from '../services/concoursService';
import { createPaiement, checkPaiementStatus } from '../services/paiementService';
import { generatePDF } from '../services/pdfService';
import { Link } from 'react-router-dom';

const colorGreen = "#25963F";

export default function PaiementContent() {
  const [concours, setConcours] = useState([]);
  const [selectedConcours, setSelectedConcours] = useState('');
  const [nomComplet, setNomComplet] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('+237'); // Préfixe par défaut
  const [paiement, setPaiement] = useState(null);
  const [recu, setRecu] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // 1. Charger les concours au démarrage
  useEffect(() => {
    getActiveConcours()
      .then((response) => {
        const dataArray = response.data?.data || response.data || [];
        setConcours(Array.isArray(dataArray) ? dataArray : []);
      })
      .catch(err => {
        console.error("[PaiementContent] Erreur récupération concours:", err);
        setConcours([]);
      });
  }, []);

  // Gestion spécifique de la saisie du téléphone
  const handlePhoneChange = (e) => {
    const val = e.target.value;
    
    // Empêche de supprimer le +237
    if (!val.startsWith('+237')) return;

    // Récupère uniquement la partie après le +237
    const suffix = val.slice(4);

    // Bloque si ce n'est pas un chiffre ou si c'est > 9 caractères
    if (/^\d*$/.test(suffix) && suffix.length <= 9) {
      setTelephone(val);
    }
  };

  // 2. Gérer la soumission du paiement
  const handlePaiementSubmit = async (e) => {
    e.preventDefault();

    // Validation de la longueur (9 chiffres après +237)
    if (telephone.length !== 13) {
      alert('Le numéro de téléphone doit comporter exactement 9 chiffres après le +237');
      return;
    }

    if (!selectedConcours) {
      alert('Veuillez sélectionner un concours');
      return;
    }

    setIsProcessing(true);
    setStatusMessage("Initialisation de la transaction...");

    const paiementData = {
      nomComplet,
      prenom,
      email,
      telephone, // Format final: +2376XXXXXXXX
      concoursId: selectedConcours,
    };

    try {
      const result = await createPaiement(paiementData);
      const { externalReference } = result;

      setStatusMessage("En attente de validation sur votre mobile (Tapez votre code PIN)...");

      const pollInterval = setInterval(async () => {
        try {
          const statusUpdate = await checkPaiementStatus(externalReference);
          if (statusUpdate.status === 'SUCCESSFUL') {
            clearInterval(pollInterval);
            setPaiement(statusUpdate.recu.paiement);
            setRecu(statusUpdate.recu);
            setIsProcessing(false);
          }
        } catch (err) {
          console.error("[Polling] Erreur:", err.message);
        }
      }, 3000);

      setTimeout(() => {
        clearInterval(pollInterval);
        if (isProcessing) {
          setIsProcessing(false);
          alert("Le délai d'attente est dépassé. Si vous avez été débité, utilisez l'option 'Reçu oublié'.");
        }
      }, 120000);

    } catch (error) {
      setIsProcessing(false);
      alert(error.response?.data?.message || 'Une erreur est survenue lors de la connexion au service.');
    }
  };

  if (isProcessing) {
    return (
      <div className="container mt-5 text-center d-flex flex-column align-items-center justify-content-center" style={{ height: '60vh' }}>
        <div className="spinner-grow text-success mb-4" style={{ width: '4rem', height: '4rem' }} role="status"></div>
        <h3 className="fw-bold" style={{ color: colorGreen }}>{statusMessage}</h3>
        <p className="text-muted px-3">Ne fermez pas cette page. Une notification a été envoyée sur le numéro <strong>{telephone}</strong>.</p>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4 fw-bold text-uppercase text-center" style={{ color: colorGreen }}>Paiement des frais de concours</h2>

      {!recu ? (
        <form onSubmit={handlePaiementSubmit} className="shadow-lg p-4 border-0 rounded-4 bg-white mx-auto" style={{ maxWidth: '800px' }}>
          <div className="mb-4">
            <label className="form-label fw-bold">1. Choisir le concours :</label>
            <select className="form-select form-select-lg border-2" value={selectedConcours} onChange={(e) => setSelectedConcours(e.target.value)} required style={{ borderColor: colorGreen }}>
              <option value="">-- Sélectionnez un concours --</option>
              {concours.map((c) => (
                <option key={c.id} value={c.id}>{c.intitule} - {c.montant?.toLocaleString()} FCFA</option>
              ))}
            </select>
          </div>

          <div className="row">
             <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Nom</label>
                <input className="form-control" value={nomComplet} onChange={(e) => setNomComplet(e.target.value)} required placeholder="Votre nom" />
             </div>
             <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Prénom</label>
                <input className="form-control" value={prenom} onChange={(e) => setPrenom(e.target.value)} required placeholder="Votre prénom" />
             </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Email</label>
                <input className="form-control" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="exemple@mail.com" />
            </div>
            <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Téléphone Mobile Money</label>
                <input 
                  className="form-control" 
                  type="text"
                  value={telephone} 
                  onChange={handlePhoneChange}
                  required 
                  placeholder="+237XXXXXXXXX" 
                />
                <small className="text-muted">Format: +237 suivi de 9 chiffres</small>
            </div>
          </div>

          <div className="d-grid gap-2 mt-4">
            <button className="btn btn-success btn-lg fw-bold shadow-sm" type="submit" style={{ backgroundColor: colorGreen }}>
              PROCÉDER AU PAIEMENT
            </button>
            <Link to="/ForgotRecu" className="btn btn-link text-decoration-none text-danger mt-2">
              J'ai déjà effectué un paiement sans avoir mon reçu
            </Link>
          </div>
        </form>
      ) : (
        <div className="card shadow-lg border-0 rounded-4 overflow-hidden mx-auto" style={{ maxWidth: '700px' }}>
          <div className="p-4 text-center text-white" style={{ backgroundColor: colorGreen }}>
            <h3 className="m-0 fw-bold">Paiement Terminé !</h3>
          </div>
          <div className="card-body p-4">
            <div className="row align-items-center">
              <div className="col-md-7">
                <h5 className="text-muted text-uppercase small fw-bold mb-3 border-bottom pb-2">Informations Candidat</h5>
                <p className="mb-1"><strong>N° Reçu :</strong> <span className="text-primary fw-bold fs-5">{recu.numeroRecu}</span></p>
                <p className="mb-1"><strong>Candidat :</strong> {nomComplet} {prenom}</p>
                <p className="mb-1"><strong>Montant :</strong> {recu.montant?.toLocaleString()} FCFA</p>
              </div>
              <div className="col-md-5 text-center">
                {recu.qrCode && (
                   <div className="p-2 border rounded bg-white shadow-sm">
                      <img src={recu.qrCode} alt="QR Code" width="100%" style={{ maxWidth: '160px' }} />
                   </div>
                )}
              </div>
            </div>
            <button className="btn btn-primary w-100 btn-lg shadow fw-bold mt-4" onClick={() => generatePDF({ paiement, recu })}>
              📥 TÉLÉCHARGER LE REÇU (PDF)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}