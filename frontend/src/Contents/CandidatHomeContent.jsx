import React, { useState, useEffect } from 'react';
import { Calendar, Clock, BookOpen, CheckCircle, AlertCircle, Award, QrCode, FileText } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import candidatService from '../services/candidatService';
import DossierService from '../services/DossierService';
import { getUserProfile } from '../services/authService';

const colorGreen = '#25963F';
const colorBlue = '#1E90FF';

export default function CandidatHomeContent() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [concoursInfo, setConcoursInfo] = useState({ intitule: '' });
  const [targetDate, setTargetDate] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  const [loading, setLoading] = useState(true);
  const [qrCode, setQrCode] = useState(null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

  // Références utiles dérivées du state - CORRIGÉ : userId au lieu de id
  const userId = user?.userId || user?.id;
  const userName = user?.nom || user?.email?.split('@')[0] || 'Candidat';

  // =========================================================
  // 1. GESTION DU RETOUR GOOGLE ET AUTHENTIFICATION
  // =========================================================
  useEffect(() => {
    const initAuth = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');

      if (token) {
        console.log("🚀 [AUTH] Flux Google détecté. Token:", token.substring(0, 10) + "...");
        localStorage.setItem('access_token', token);
        
        const candidateId = params.get('candidateId');
        const step = params.get('step');
        if (candidateId) localStorage.setItem('candidateId', candidateId);
        if (step) localStorage.setItem('registrationStep', step);

        try {
          console.log("📡 [AUTH] Appel de getUserProfile...");
          const userData = await getUserProfile(); 
          console.log("✅ [AUTH] Profil récupéré avec succès:", userData);
          
          localStorage.setItem('user', JSON.stringify(userData));
          setUser(userData); 
        } catch (err) {
          console.error("❌ [AUTH] Erreur récupération profil:", err);
        }

        navigate('/candidat/home', { replace: true });
      } else if (!user && !token) {
        console.warn("⚠️ [AUTH] Aucun utilisateur trouvé, redirection login.");
        navigate('/login');
      }
    };

    initAuth();
  }, [location, navigate]);

  // =========================================================
  // 2. CHARGEMENT DES DONNÉES DU DASHBOARD
  // =========================================================
  useEffect(() => {
    // On attend d'avoir l'ID avant de lancer les appels métiers
    if (!userId) {
      console.log("⏳ [DASHBOARD] En attente de l'ID utilisateur pour charger les données...");
      return;
    }

    const fetchDashboardData = async () => {
      console.log("🏗️ [DASHBOARD] Lancement du chargement des données pour ID:", userId);
      setLoading(true);
      
      try {
        const [infoResult, countdownResult, qrResult] = await Promise.allSettled([
          candidatService.getDashboardConcoursInfo(userId),
          candidatService.getDashboardCountdown(userId),
          DossierService.getCandidateQrCode(userId)
        ]);

        // Log des résultats pour debug
        console.log("📊 [DASHBOARD] Résultats des promesses:", { infoResult, countdownResult, qrResult });

        if (infoResult.status === 'fulfilled') {
            setConcoursInfo(infoResult.value);
        }
        
        if (countdownResult.status === 'fulfilled' && countdownResult.value?.dateTarget) {
          console.log("📅 [DASHBOARD] Date cible trouvée:", countdownResult.value.dateTarget);
          setTargetDate(new Date(countdownResult.value.dateTarget));
        }

        if (qrResult.status === 'fulfilled' && qrResult.value?.qrCode) {
          console.log("📱 [DASHBOARD] QR Code récupéré.");
          setQrCode(qrResult.value.qrCode);
        }

      } catch (error) {
        console.error("❌ [DASHBOARD] Erreur fatale lors du chargement:", error);
      } finally {
        console.log("🏁 [DASHBOARD] Fin du chargement.");
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [userId]); 

  // =========================================================
  // 3. LOGIQUE DU TIMER
  // =========================================================
  useEffect(() => {
    if (!targetDate) return;

    const updateCountdown = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();
      
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        mins: Math.floor((difference / 1000 / 60) % 60),
        secs: Math.floor((difference / 1000) % 60),
      });
    };
    
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const handleDownloadReceipt = () => {
    window.open(`http://localhost:3000/dossiers/verify/${userId}`, '_blank');
  };

  // Affichage du loader pendant la phase d'auth Google
  if (loading && !userId) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: '80vh' }}>
        <div className="spinner-border mb-3" style={{ color: colorBlue }} role="status"></div>
        <p className="text-muted fw-bold">Identification en cours...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 animate__animated animate__fadeIn" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      
      {/* 1. HEADER DE BIENVENUE */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="bg-white p-4 rounded-4 shadow-sm border-bottom border-4" style={{ borderColor: colorBlue }}>
            <div className="d-flex align-items-center">
              <div className="me-4 d-none d-md-block">
                <div className="rounded-circle p-3" style={{ backgroundColor: `${colorBlue}20` }}>
                  <Award size={40} color={colorBlue} />
                </div>
              </div>
              <div>
                <h2 className="fw-bold mb-1" style={{ color: '#2d3436' }}>
                  Bonjour, <span style={{ color: colorBlue }}>{userName}</span> !
                </h2>
                <p className="text-muted mb-0 fs-5">
                  Bienvenue sur votre espace pour le <span className="fw-bold" style={{ color: colorGreen }}>{concoursInfo?.intitule || 'votre concours'}</span>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* 2. SECTION COMPTE À REBOURS */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-header bg-white border-0 pt-4 px-4">
              <h5 className="fw-bold d-flex align-items-center">
                <Clock className="me-2" size={20} color={colorBlue} />
                TEMPS RESTANT AVANT L'ÉPREUVE
              </h5>
            </div>
            <div className="card-body p-4">
              <div className="row g-3 text-center">
                <CountdownItem value={timeLeft.days} label="Jours" color={colorBlue} />
                <CountdownItem value={timeLeft.hours} label="Heures" color={colorGreen} />
                <CountdownItem value={timeLeft.mins} label="Minutes" color="#34495e" />
                <CountdownItem value={timeLeft.secs} label="Secondes" color="#e74c3c" />
              </div>
              <div className="mt-4 p-3 rounded-3" style={{ backgroundColor: '#eef2f7', borderLeft: `4px solid ${colorBlue}` }}>
                <small className="text-dark fw-medium">
                  <AlertCircle size={16} className="me-2" />
                  Date prévue : <span className="text-primary">{targetDate ? targetDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'À définir'}</span>
                </small>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-header bg-white border-0 pt-4 px-4">
              <h5 className="fw-bold d-flex align-items-center">
                <BookOpen className="me-2" size={20} color={colorGreen} />
                CONSEILS POUR RÉUSSIR
              </h5>
            </div>
            <div className="card-body px-4 pb-4">
              <div className="row g-3">
                <TipItem title="Organisation" text="Prévoyez au moins 2h de révision par jour." />
                <TipItem title="Documents" text="Imprimez votre récépissé final dès validation." />
                <TipItem title="Repos" text="Ne négligez pas votre sommeil." />
              </div>
            </div>
          </div>
        </div>

        {/* 3. SIDEBAR : ÉTAT & QR CODE */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 text-white mb-4" style={{ backgroundColor: qrCode ? colorGreen : '#636e72' }}>
            <div className="card-body p-4 text-center">
              <CheckCircle size={50} className="mb-3" />
              <h4 className="fw-bold">{qrCode ? 'Dossier Validé' : 'Dossier en cours'}</h4>
              <p className="opacity-75 small">
                {qrCode 
                  ? 'Votre candidature est prête.' 
                  : 'L\'administration vérifie votre dossier.'}
              </p>
            </div>
          </div>

          {qrCode && (
            <div className="card border-0 shadow-sm rounded-4 mb-4 animate__animated animate__zoomIn">
              <div className="card-body p-4 text-center">
                <div className="d-flex align-items-center justify-content-center mb-3">
                  <QrCode size={20} className="me-2 text-primary" />
                  <span className="fw-bold text-dark">VOTRE PASSE D'EXAMEN</span>
                </div>
                <div className="p-3 bg-light rounded-3 d-inline-block border">
                  <img src={qrCode} alt="QR Code" style={{ width: '160px', height: '160px' }} />
                </div>
                <p className="text-muted small mt-3">Présentez ce code à l'entrée.</p>
                <button 
                  onClick={handleDownloadReceipt}
                  className="btn btn-primary w-100 fw-bold rounded-pill shadow-sm d-flex align-items-center justify-content-center py-2"
                >
                  <FileText size={18} className="me-2" />
                  Télécharger le Récépissé
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CountdownItem({ value, label, color }) {
  return (
    <div className="col-3">
      <div className="rounded-4 p-3 shadow-sm text-white" style={{ backgroundColor: color }}>
        <div className="h2 fw-bold mb-0">{value.toString().padStart(2, '0')}</div>
      </div>
      <div className="small fw-bold text-uppercase mt-2 text-muted">{label}</div>
    </div>
  );
}

function TipItem({ title, text }) {
  return (
    <div className="col-md-4">
      <div className="h-100 p-3 rounded-3 border bg-white">
        <h6 className="fw-bold text-dark">{title}</h6>
        <p className="small text-muted mb-0">{text}</p>
      </div>
    </div>
  );
}