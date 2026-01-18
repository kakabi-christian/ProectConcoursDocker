import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCandidateInfo } from '../services/authService';
import { getPiecesDossier } from '../services/PiecesDossierService'; 

// Composant pour afficher un champ d'information
const InfoField = ({ label, value, iconClass }) => (
  <div className="col-lg-4 col-md-6 mb-4">
    <div className="p-3 border rounded h-100 shadow-sm" style={{ backgroundColor: '#f0f4f8', borderColor: '#d9e2ec' }}>
      <div className="d-flex align-items-center">
        <i className={`${iconClass} me-3 text-primary fs-5`}></i> 
        <div>
          <small className="text-muted text-uppercase fw-bold d-block">{label}</small>
          <p className="mb-0 fw-semibold text-dark text-break">
            {value || <span className="text-danger fst-italic">Non renseigné</span>}
          </p>
        </div>
      </div>
    </div>
  </div>
);

// Fonction pour formater la date
const formatDate = (dateString) => {
  if (!dateString) return null;
  try {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
};

export default function CandidateInfoContent() {
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pieces, setPieces] = useState([]);
  const [checkedPieces, setCheckedPieces] = useState({});
  const [isTerminating, setIsTerminating] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      // --- LOGIQUE DE RÉCUPÉRATION DE L'ID ---
      const searchParams = new URLSearchParams(window.location.search);
      // On regarde d'abord dans l'URL, sinon dans le localStorage
      const candidateId = searchParams.get('candidateId') || localStorage.getItem('candidateId');

      if (!candidateId) {
        setError('ID du candidat introuvable. Veuillez vous reconnecter ou vérifier l\'URL.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // 1. Récupérer les informations du candidat
        const data = await getCandidateInfo(candidateId); 
        setCandidate(data);

        // 2. Récupérer les pièces du dossier
        const piecesData = await getPiecesDossier();
        setPieces(piecesData);

        // 3. Initialiser l'état des checkbox
        const initialChecked = {};
        piecesData.forEach(piece => {
          initialChecked[piece.id] = false;
        });
        setCheckedPieces(initialChecked);

      } catch (err) {
        console.error("Erreur lors de la récupération des données:", err);
        setError(err.response?.data?.message || 'Impossible de récupérer les informations. Le serveur ne répond pas.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // On laisse le tableau vide car l'ID est géré au montage

  const handleCheckboxChange = (pieceId) => {
    setCheckedPieces(prev => ({
      ...prev,
      [pieceId]: !prev[pieceId]
    }));
  };
  
  const areAllPiecesChecked = pieces.length > 0 && 
                              pieces.every(piece => checkedPieces[piece.id]);

  const handleTerminate = () => {
    if (!areAllPiecesChecked) return;
    setIsTerminating(true);
    setTimeout(() => {
      setIsTerminating(false);
      navigate('/Login');
    }, 3000);
  };

  // --- AFFICHAGE DES ÉTATS ---

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
        <p className="mt-2">Chargement de votre dossier...</p>
      </div>
    );
  }

  if (isTerminating) {
    return (
      <div className="container mt-5 text-center d-flex flex-column align-items-center justify-content-center" style={{ height: '70vh' }}>
        <h2 className='mb-4 text-success'>Validation et Enregistrement en cours...</h2>
        <div className="spinner-grow text-success" style={{ width: '4rem', height: '4rem' }} role="status">
          <span className="visually-hidden">Traitement...</span>
        </div>
        <p className="mt-4 lead text-muted">Veuillez patienter, vous allez être redirigé(e).</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger shadow" role="alert">
          <h4 className="alert-heading">❌ Accès Impossible</h4>
          <p className="mb-0">{error}</p>
        </div>
      </div>
    );
  }

  // --- RENDU DU DOSSIER ---

  return (
    <div className="container my-5 animate__animated animate__fadeIn">
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <h1 className="text-dark fw-light">
          <i className="bi bi-person-badge me-2 text-primary"></i> 
          Dossier Candidat: <span className='fw-bold'>{candidate.prenom} {candidate.nom}</span>
        </h1>
      </div>

      <div className="row g-4">
        {/* Identité */}
        <div className="col-12">
          <h4 className="mb-3 text-primary border-bottom border-primary pb-2"><i className="bi bi-person-fill me-2"></i> Identité & Contact</h4>
          <div className="row">
            <InfoField label="Nom Complet" value={`${candidate.prenom} ${candidate.nom}`} iconClass="bi bi-person-vcard" />
            <InfoField label="Email" value={candidate.email} iconClass="bi bi-envelope-fill" />
            <InfoField label="Téléphone" value={candidate.telephone} iconClass="bi bi-phone-fill" />
            <InfoField label="Nationalité" value={candidate.nationalite} iconClass="bi bi-flag-fill" />
            <InfoField label="Numéro CNI" value={candidate.numeroCni} iconClass="bi bi-credit-card-2-front-fill" />
            <InfoField label="Sexe" value={candidate.sexe} iconClass="bi bi-gender-ambiguous" />
          </div>
        </div>

        {/* Localisation */}
        <div className="col-12 mt-4">
          <h4 className="mb-3 text-primary border-bottom border-primary pb-2"><i className="bi bi-geo-alt-fill me-2"></i> Localisation & Naissance</h4>
          <div className="row">
            <InfoField label="Date de naissance" value={formatDate(candidate.dateNaissance)} iconClass="bi bi-calendar-date-fill" />
            <InfoField label="Lieu de naissance" value={candidate.lieuNaissance} iconClass="bi bi-pin-map-fill" />
            <InfoField label="Ville" value={candidate.ville} iconClass="bi bi-building-fill" />
            <InfoField label="Région" value={candidate.region} iconClass="bi bi-globe-americas" />
          </div>
        </div>
        
        {/* Parents */}
        <div className="col-12 mt-4">
          <h4 className="mb-3 text-primary border-bottom border-primary pb-2"><i className="bi bi-people-fill me-2"></i> Informations Parentales</h4>
          <div className="row">
            <InfoField label="Nom du père" value={candidate.nomPere} iconClass="bi bi-person-square" />
            <InfoField label="Téléphone du père" value={candidate.telephonePere} iconClass="bi bi-telephone-fill" />
            <InfoField label="Nom de la mère" value={candidate.nomMere} iconClass="bi bi-person-square" />
            <InfoField label="Téléphone de la mère" value={candidate.telephoneMere} iconClass="bi bi-telephone-fill" />
          </div>
        </div>

        {/* Examen */}
        <div className="col-12 mt-4">
          <h4 className="mb-3 text-primary border-bottom border-primary pb-2"><i className="bi bi-book-fill me-2"></i> Dossier Examen</h4>
          <div className="row">
            <InfoField label="Type d’examen" value={candidate.typeExamen} iconClass="bi bi-file-earmark-check-fill" />
            <InfoField label="Spécialité" value={candidate.specialite} iconClass="bi bi-lightbulb-fill" />
            <InfoField label="Série" value={candidate.serie} iconClass="bi bi-list-ol" />
            <InfoField label="Centre d’examen" value={candidate.centreExamen} iconClass="bi bi-building-up" />
          </div>
        </div>
      </div>
      
    
    </div>
  );
}