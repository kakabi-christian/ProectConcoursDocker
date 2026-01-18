import React, { useState } from 'react';
import {
  requestOtp,
  verifyOtpAndGetRecu,
} from '../services/paiementService';
import jsPDF from 'jspdf';

export default function ForgotRecu() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1=email | 2=otp | 3=reçu
  const [recu, setRecu] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // 🔐 ÉTAPE 1 : envoyer OTP
  const handleRequestOtp = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await requestOtp(email);
      setTimeout(() => {
        setMessage('Un code de vérification a été envoyé à votre email.');
        setStep(2);
        setLoading(false);
      }, 2000);
    } catch (err) {
      setTimeout(() => {
        setError('Aucun reçu trouvé pour cet email.');
        setLoading(false);
      }, 2000);
    }
  };

  // 🔐 ÉTAPE 2 : vérifier OTP
  const handleVerifyOtp = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const data = await verifyOtpAndGetRecu(email, otp);
      setTimeout(() => {
        setRecu(data);
        setStep(3);
        setLoading(false);
      }, 2000);
    } catch (err) {
      setTimeout(() => {
        setError('Code invalide ou expiré.');
        setLoading(false);
      }, 2000);
    }
  };

  // 📄 Télécharger le PDF
  const handleDownloadPDF = () => {
    if (!recu) return;

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Reçu de Paiement', 20, 20);

    doc.setFontSize(12);
    doc.text(`Numéro du reçu : ${recu.numeroRecu}`, 20, 40);
    doc.text(`Nom : ${recu.paiement.nomComplet}`, 20, 50);
    doc.text(`Email : ${recu.paiement.email}`, 20, 60);
    doc.text(`Téléphone : ${recu.paiement.telephone}`, 20, 70);
    doc.text(`Concours : ${recu.concours}`, 20, 80);
    doc.text(`Montant : ${recu.montant}`, 20, 90);

    if (recu.qrCode) {
      doc.addImage(recu.qrCode, 'PNG', 20, 100, 60, 60);
    }

    doc.save(`${recu.numeroRecu}.pdf`);
  };

  return (
    <div className="container mt-5 mb-5">
      <h2>🔐 Récupérer mon reçu</h2>

      {/* ÉTAPE 1 : EMAIL */}
      {step === 1 && (
        <>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '400px' }}
            />
          </div>

          <button
            className="btn btn-primary"
            onClick={handleRequestOtp}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Envoi du code...
              </>
            ) : (
              'Envoyer le code'
            )}
          </button>
        </>
      )}

      {/* ÉTAPE 2 : OTP */}
      {step === 2 && (
        <>
          <div className="mb-3 mt-3">
            <label className="form-label">Code de vérification</label>
            <input
              type="text"
              className="form-control"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              style={{ width: '200px' }}
            />
          </div>

          <button
            className="btn btn-success"
            onClick={handleVerifyOtp}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Vérification...
              </>
            ) : (
              'Vérifier le code'
            )}
          </button>
        </>
      )}

      {/* MESSAGES */}
      {message && <div className="alert alert-success mt-3">{message}</div>}
      {error && <div className="alert alert-danger mt-3">{error}</div>}

      {/* ÉTAPE 3 : REÇU */}
      {step === 3 && recu && (
        <div className="card mt-4 p-3">
          <h5>✅ Reçu trouvé</h5>
          <p><strong>Numéro :</strong> {recu.numeroRecu}</p>
          <p><strong>Nom :</strong> {recu.paiement.nomComplet}</p>
          <p><strong>Email :</strong> {recu.paiement.email}</p>
          <p><strong>Téléphone :</strong> {recu.paiement.telephone}</p>
          <p><strong>Concours :</strong> {recu.concours}</p>
          <p><strong>Montant :</strong> {recu.montant}</p>

          {recu.qrCode && (
            <img
              src={recu.qrCode}
              alt="QR Code"
              style={{ width: 150, height: 150 }}
            />
          )}

          <button className="btn btn-success mt-3" onClick={handleDownloadPDF}>
            Télécharger le PDF
          </button>
        </div>
      )}
    </div>
  );
}
