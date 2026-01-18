import React, { useEffect, useState } from 'react';
import StatistiqueService from '../services/StatistiqueService';
import 'bootstrap-icons/font/bootstrap-icons.css';
import ReportContent from './ReportContent';

// Fonction d'aide pour formater les nombres en devise
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return 'N/A';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF', // Généralement utilisé pour le FCFA
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('XOF', 'FCFA');
};

// =========================================================================
// NOUVELLE FONCTION POUR RENDER LES DONNÉES COMPLEXES NON JSON BRUTES
// =========================================================================
const renderStructuredData = (title, data) => {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="alert alert-info text-center">
        <i className="bi bi-info-circle me-2"></i> Aucune donnée {title.toLowerCase()} disponible.
      </div>
    );
  }

  const parseAndRender = (key, value) => {
    // 1. Cas simple: Nombre ou chaîne
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return <span className="badge bg-light text-dark border">{JSON.stringify(value)}</span>;
    }

    // 2. Cas complexe: Objet
    return (
      <ul className="list-group list-group-flush list-group-sm">
        {Object.entries(value).map(([subKey, subValue]) => (
          <li key={subKey} className="list-group-item d-flex justify-content-between align-items-center p-1 bg-transparent border-0">
            <span className="text-muted small fw-normal">{subKey}</span>
            <span className="badge bg-secondary">{typeof subValue === 'object' ? JSON.stringify(subValue) : subValue}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="table-responsive">
      <table className="table table-sm table-borderless align-middle mb-0">
        <thead>
          <tr className="border-bottom">
            <th className="text-uppercase text-muted small py-2">Catégorie</th>
            <th className="text-uppercase text-muted small text-end py-2">Détail / Valeur</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(data).map(([key, value], idx) => (
            <tr key={key} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
              <td className="fw-semibold text-dark py-2">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</td>
              <td className="text-end py-2">{parseAndRender(key, value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
// =========================================================================

export default function StatistiqueContent() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    candidats: null,
    concours: null,
    sessions: null,
    paiements: null,
    recus: null,
    admins: null,
    feedbacks: null,
    notifications: null,
    dashboard: null,
  });

  useEffect(() => {
    const fetchAllStats = async () => {
      try {
        setLoading(true);

        const [
          totalCandidats, sexeCandidats, pourcentageSexe, candidatsParSpecialite, candidatsParFiliere, candidatsParTypeBac, candidatsParMention,
          candidatsParConcours, statutPaiementsParConcours, candidatsParSession,
          totalPaiements, paiementsParMode, nombrePaiementsStatut,
          statsRecus,
          totalAdminsVsCandidats, utilisateursVerifies,
          feedbacksParUtilisateur, notificationsStat, statistiquesTableauDeBord,
        ] = await Promise.all([
          StatistiqueService.totalCandidats(),
          StatistiqueService.sexeCandidats(),
          StatistiqueService.pourcentageSexe(),
          StatistiqueService.candidatsParSpecialite(),
          StatistiqueService.candidatsParFiliere(),
          StatistiqueService.candidatsParTypeBac(),
          StatistiqueService.candidatsParMention(),
          StatistiqueService.candidatsParConcours(),
          StatistiqueService.statutPaiementsParConcours(),
          StatistiqueService.candidatsParSession(),
          StatistiqueService.totalPaiements(),
          StatistiqueService.paiementsParMode(),
          StatistiqueService.nombrePaiementsStatut(),
          StatistiqueService.statsRecus(),
          StatistiqueService.totalAdminsVsCandidats(),
          StatistiqueService.utilisateursVerifies(),
          StatistiqueService.feedbacksParUtilisateur(),
          StatistiqueService.notificationsStat(),
          StatistiqueService.statistiquesTableauDeBord(),
        ]);

        setStats({
          candidats: { totalCandidats, sexeCandidats, pourcentageSexe, candidatsParSpecialite, candidatsParFiliere, candidatsParTypeBac, candidatsParMention },
          concours: { candidatsParConcours, statutPaiementsParConcours },
          sessions: { candidatsParSession },
          paiements: { totalPaiements, paiementsParMode, nombrePaiementsStatut },
          recus: statsRecus,
          admins: { totalAdminsVsCandidats, utilisateursVerifies },
          feedbacks: feedbacksParUtilisateur,
          notifications: notificationsStat,
          dashboard: statistiquesTableauDeBord,
        });

      } catch (err) {
        console.error(err);
        setError('Erreur lors du chargement des statistiques. Vérifiez la connexion au service.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllStats();
  }, []);

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '80vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="spinner-border text-white mb-4" role="status" style={{ width: '4rem', height: '4rem', borderWidth: '0.4rem' }}>
          <span className="visually-hidden">Chargement...</span>
        </div>
        <h4 className="text-white fw-bold mb-2">Chargement des statistiques...</h4>
        <p className="text-white-50">Récupération de toutes les données en cours</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger shadow-lg border-0 rounded-4" role="alert">
          <div className="d-flex align-items-center">
            <i className="bi bi-exclamation-triangle-fill fs-2 me-3"></i>
            <div>
              <h5 className="alert-heading mb-1">Erreur de chargement</h5>
              <p className="mb-0">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // =========================================================================
  // FONCTION DE RENDU POUR LES DONNÉES SIMPLES (ancienne fonction renommée pour la clarté)
  // Non utilisée pour les données complexes, mais conservée si besoin
  // =========================================================================
  const renderSimpleDataAsTable = (data) => {
    if (typeof data !== 'object' || data === null) {
      return <pre className="bg-light p-3 rounded-3 border">{String(data)}</pre>;
    }
    const keys = Object.keys(data);
    if (keys.length === 0) return <p className="text-muted fst-italic">Aucune donnée disponible.</p>;

    return (
      <div className="table-responsive">
        <table className="table table-hover table-sm mb-0">
          <tbody>
            {keys.map(key => (
              <tr key={key}>
                <td className="fw-semibold text-dark">{key}</td>
                <td className="text-end">
                  <span className="badge bg-light text-dark border">{JSON.stringify(data[key])}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  // =========================================================================
  // LOGIQUE POUR DÉCONSTRUIRE ET AFFICHER LE DASHBOARD COMBINÉ (stats.dashboard)
  // =========================================================================
  const renderDashboardDetails = (dashboardData) => {
      if (!dashboardData || Object.keys(dashboardData).length === 0) {
          return <p className="text-muted fst-italic">Aucune donnée de tableau de bord disponible.</p>;
      }

      const getBadgeClass = (mention) => {
          switch(mention) {
              case 'TRES_BIEN': return 'bg-success';
              case 'BIEN': return 'bg-info';
              case 'ASSEZ_BIEN': return 'bg-primary';
              case 'PASSABLE': return 'bg-secondary';
              default: return 'bg-light text-dark';
          }
      };

      return (
          <div className="row g-4">
              {/* Sexe */}
              <div className="col-md-6">
                  <h6 className="fw-bold text-muted border-bottom pb-2">Répartition par Sexe</h6>
                  <div className="p-3 rounded-3" style={{backgroundColor: '#e0e7ff'}}>
                      <div className="d-flex justify-content-between align-items-center">
                          <span className="fw-semibold text-primary"><i className="bi bi-gender-male me-2"></i> Masculins</span>
                          <span className="badge bg-primary fs-6">{dashboardData.sexe?.masculins || 0}</span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mt-2">
                          <span className="fw-semibold text-danger"><i className="bi bi-gender-female me-2"></i> Féminins</span>
                          <span className="badge bg-danger fs-6">{dashboardData.sexe?.feminins || 0}</span>
                      </div>
                  </div>
              </div>
              {/* Paiements */}
              <div className="col-md-6">
                  <h6 className="fw-bold text-muted border-bottom pb-2">Total Paiements</h6>
                  <div className="p-3 rounded-3 text-center" style={{backgroundColor: '#d1fae5'}}>
                      <i className="bi bi-cash-coin text-success fs-3"></i>
                      <div className="fw-bold fs-3 text-success mt-1">{formatCurrency(dashboardData.paiements || 0)}</div>
                  </div>
              </div>

              {/* Filières */}
              <div className="col-12">
                  <h6 className="fw-bold text-muted border-bottom pb-2">Candidats par Filière</h6>
                  <div className="list-group">
                      {dashboardData.filieres?.map((f, idx) => (
                          <div key={idx} className="list-group-item d-flex justify-content-between align-items-center" style={{backgroundColor: idx % 2 === 0 ? '#f9fafb' : '#ffffff'}}>
                              <span className="fw-semibold text-dark">{f.filiere}</span>
                              <span className="badge bg-secondary rounded-pill fs-6">{f.total}</span>
                          </div>
                      ))}
                  </div>
              </div>

              {/* Spécialités */}
              <div className="col-md-6">
                  <h6 className="fw-bold text-muted border-bottom pb-2">Candidats par Spécialité</h6>
                  <div className="list-group">
                      {Object.entries(dashboardData.specialites || {}).map(([spec, det], idx) => (
                          <div key={spec} className="list-group-item d-flex justify-content-between align-items-center" style={{backgroundColor: idx % 2 === 0 ? '#f9fafb' : '#ffffff'}}>
                              <span className="fw-semibold text-dark">{spec}</span>
                              <span className="badge bg-primary rounded-pill">{det.total}</span>
                          </div>
                      ))}
                  </div>
              </div>
              
              {/* Mentions */}
              <div className="col-md-6">
                  <h6 className="fw-bold text-muted border-bottom pb-2">Répartition par Mention</h6>
                  <div className="list-group">
                      {dashboardData.mentions?.map((m, idx) => (
                          <div key={idx} className="list-group-item d-flex justify-content-between align-items-center" style={{backgroundColor: idx % 2 === 0 ? '#f9fafb' : '#ffffff'}}>
                              <span className="fw-semibold text-dark">{m.Mention}</span>
                              <span className={`badge ${getBadgeClass(m.Mention)} rounded-pill fs-6`}>{m._count.id}</span>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      );
  };
  // =========================================================================

  return (
    <div className="container-fluid py-5" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* En-tête avec dégradé */}
      <div className="text-center mb-5 pb-4">
        <div className="d-inline-block px-4 py-2 rounded-pill mb-3" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <i className="bi bi-graph-up-arrow text-white fs-4"></i>
        </div>
        <h1 className="display-5 fw-bold mb-2" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Tableau de Bord Statistiques
        </h1>
        <p className="text-muted fs-5">Vue d'ensemble complète des données du système</p>
      </div>

      {/* Cartes principales - KPI */}
      <div className="row g-4 mb-5">
        {/* Total Candidats */}
        <div className="col-xl-4 col-lg-6">
          <div className="card border-0 shadow-lg h-100 overflow-hidden" style={{ borderRadius: '20px' }}>
            <div className="position-absolute top-0 end-0 p-4 opacity-25">
              <i className="bi bi-people-fill" style={{ fontSize: '6rem', color: '#667eea' }}></i>
            </div>
            <div className="card-body p-4 position-relative">
              <div className="d-flex align-items-center mb-3">
                <div className="rounded-circle p-3 me-3" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <i className="bi bi-people-fill text-white fs-3"></i>
                </div>
                <div>
                  <p className="text-muted mb-1 small text-uppercase fw-semibold">Total Candidats</p>
                  <h2 className="mb-0 fw-bold" style={{ color: '#667eea' }}>{stats.candidats.totalCandidats}</h2>
                </div>
              </div>
              <div className="mt-4 pt-3 border-top">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="d-flex align-items-center">
                    <i className="bi bi-gender-male text-primary me-2"></i>
                    <span className="fw-semibold">Garçons</span>
                  </span>
                  <span className="badge rounded-pill px-3 py-2" style={{ background: '#e0e7ff', color: '#667eea' }}>
                    {stats.candidats.sexeCandidats?.male || 0} ({stats.candidats.pourcentageSexe?.male || 0}%)
                  </span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="d-flex align-items-center">
                    <i className="bi bi-gender-female text-danger me-2"></i>
                    <span className="fw-semibold">Filles</span>
                  </span>
                  <span className="badge rounded-pill px-3 py-2" style={{ background: '#ffe4e6', color: '#e11d48' }}>
                    {stats.candidats.sexeCandidats?.female || 0} ({stats.candidats.pourcentageSexe?.female || 0}%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Total Paiements */}
        <div className="col-xl-4 col-lg-6">
          <div className="card border-0 shadow-lg h-100 overflow-hidden" style={{ borderRadius: '20px' }}>
            <div className="position-absolute top-0 end-0 p-4 opacity-25">
              <i className="bi bi-cash-stack" style={{ fontSize: '6rem', color: '#10b981' }}></i>
            </div>
            <div className="card-body p-4 position-relative">
              <div className="d-flex align-items-center mb-3">
                <div className="rounded-circle p-3 me-3" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                  <i className="bi bi-wallet2 text-white fs-3"></i>
                </div>
                <div>
                  <p className="text-muted mb-1 small text-uppercase fw-semibold">Total Payé</p>
                  <h2 className="mb-0 fw-bold text-success">{formatCurrency(stats.paiements.totalPaiements)}</h2>
                </div>
              </div>
              <div className="mt-4 pt-3 border-top">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="d-flex align-items-center">
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    <span className="fw-semibold">Succès</span>
                  </span>
                  <span className="badge rounded-pill px-3 py-2" style={{ background: '#d1fae5', color: '#059669' }}>
                    {stats.paiements.nombrePaiementsStatut.find(s => s.statut === 'SUCCESS')?._count.id || 0}
                  </span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="d-flex align-items-center">
                    <i className="bi bi-exclamation-circle-fill text-warning me-2"></i>
                    <span className="fw-semibold">En attente/Échoué</span>
                  </span>
                  <span className="badge rounded-pill px-3 py-2" style={{ background: '#fef3c7', color: '#d97706' }}>
                    {(stats.paiements.nombrePaiementsStatut.find(s => s.statut === 'PENDING')?._count.id || 0) + (stats.paiements.nombrePaiementsStatut.find(s => s.statut === 'FAILED')?._count.id || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reçus */}
        <div className="col-xl-4 col-lg-6">
          <div className="card border-0 shadow-lg h-100 overflow-hidden" style={{ borderRadius: '20px' }}>
            <div className="position-absolute top-0 end-0 p-4 opacity-25">
              <i className="bi bi-file-earmark-text-fill" style={{ fontSize: '6rem', color: '#f59e0b' }}></i>
            </div>
            <div className="card-body p-4 position-relative">
              <div className="d-flex align-items-center mb-3">
                <div className="rounded-circle p-3 me-3" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                  <i className="bi bi-file-earmark-check-fill text-white fs-3"></i>
                </div>
                <div>
                  <p className="text-muted mb-1 small text-uppercase fw-semibold">Reçus Totaux</p>
                  <h2 className="mb-0 fw-bold text-warning">{stats.recus.totalRecus}</h2>
                </div>
              </div>
              <div className="mt-4 pt-3 border-top">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="d-flex align-items-center">
                    <i className="bi bi-check2-square text-success me-2"></i>
                    <span className="fw-semibold">Utilisés</span>
                  </span>
                  <span className="badge rounded-pill px-3 py-2" style={{ background: '#d1fae5', color: '#059669' }}>
                    {stats.recus.utilisés}
                  </span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="d-flex align-items-center">
                    <i className="bi bi-square text-secondary me-2"></i>
                    <span className="fw-semibold">Non utilisés</span>
                  </span>
                  <span className="badge rounded-pill px-3 py-2" style={{ background: '#e5e7eb', color: '#6b7280' }}>
                    {stats.recus.nonUtilisés}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Détails */}
      <div className="row g-4 mb-5">
        {/* Spécialités */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-lg h-100" style={{ borderRadius: '20px' }}>
            <div className="card-header border-0 py-4 px-4" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}>
              <h5 className="mb-0 text-white fw-bold d-flex align-items-center">
                <i className="bi bi-diagram-3-fill me-2"></i>
                Candidats par Spécialité
              </h5>
            </div>
            <div className="card-body p-0">
              <div className="list-group list-group-flush">
                {Object.entries(stats.candidats.candidatsParSpecialite).map(([specialite, details], idx) => (
                  <div key={specialite} className="list-group-item border-0 px-4 py-3 d-flex justify-content-between align-items-center" style={{ backgroundColor: idx % 2 === 0 ? '#f9fafb' : '#ffffff' }}>
                    <div>
                      <span className="fw-semibold text-dark">{specialite}</span>
                      <div className="small text-muted mt-1">
                        <i className="bi bi-gender-male me-1"></i>{details.garçons} garçons
                        <span className="mx-2">•</span>
                        <i className="bi bi-gender-female me-1"></i>{details.filles} filles
                      </div>
                    </div>
                    <span className="badge rounded-pill px-3 py-2 fs-6" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                      {details.total}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Filières */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-lg h-100" style={{ borderRadius: '20px' }}>
            <div className="card-header border-0 py-4 px-4" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}>
              <h5 className="mb-0 text-white fw-bold d-flex align-items-center">
                <i className="bi bi-book-fill me-2"></i>
                Candidats par Filière
              </h5>
            </div>
            <div className="card-body p-0">
              <div className="list-group list-group-flush">
                {stats.candidats.candidatsParFiliere.map((filiere, idx) => (
                  <div key={filiere.filiere} className="list-group-item border-0 px-4 py-3 d-flex justify-content-between align-items-center" style={{ backgroundColor: idx % 2 === 0 ? '#f9fafb' : '#ffffff' }}>
                    <div>
                      <span className="fw-semibold text-dark">{filiere.filiere}</span>
                      <div className="small text-muted mt-1">
                        <i className="bi bi-gender-male me-1"></i>{filiere.garçons} garçons
                        <span className="mx-2">•</span>
                        <i className="bi bi-gender-female me-1"></i>{filiere.filles} filles
                      </div>
                    </div>
                    <span className="badge rounded-pill px-3 py-2 fs-6" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', color: 'white' }}>
                      {filiere.total}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Paiements et Concours */}
      <div className="row g-4 mb-5">
        {/* Modes de paiement */}
        <div className="col-lg-12">
          <div className="card border-0 shadow-lg h-100" style={{ borderRadius: '20px' }}>
            <div className="card-header border-0 py-4 px-4" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}>
              <h5 className="mb-0 text-white fw-bold d-flex align-items-center">
                <i className="bi bi-credit-card-fill me-2"></i>
                Modes de Paiement
              </h5>
            </div>
            <div className="card-body p-4">
              {stats.paiements.paiementsParMode.map((mode, idx) => (
                <div key={mode.modePaiement} className={`p-3 rounded-3 ${idx > 0 ? 'mt-3' : ''}`} style={{ backgroundColor: '#f0fdf4' }}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-semibold text-dark">{mode.modePaiement}</span>
                    <span className="badge bg-success rounded-pill">{mode._count.id}</span>
                  </div>
                  <div className="fs-5 fw-bold text-success">{formatCurrency(mode._sum.montantTotal)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

       
      </div>
       {/* Concours */}
        <div className="col-lg-12">
          <div className="card border-0 shadow-lg h-100" style={{ borderRadius: '20px' }}>
            <div className="card-header border-0 py-4 px-4" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}>
              <h5 className="mb-0 text-white fw-bold d-flex align-items-center">
                <i className="bi bi-trophy-fill me-2"></i>
                Statistiques par Concours
              </h5>
            </div>
            <div className="card-body p-4">
              {stats.concours.candidatsParConcours.map((concours, idx) => (
                <div key={concours.concours} className={`p-4 rounded-3 ${idx > 0 ? 'mt-3' : ''}`} style={{ backgroundColor: '#eff6ff', border: '2px solid #dbeafe' }}>
                  <h6 className="fw-bold text-primary mb-3">{concours.concours}</h6>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-people-fill text-primary me-2 fs-5"></i>
                        <div>
                          <div className="small text-muted">Candidats</div>
                          <div className="fw-bold">{concours.nbCandidats}</div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-cash-stack text-success me-2 fs-5"></i>
                        <div>
                          <div className="small text-muted">Total</div>
                          <div className="fw-bold">{formatCurrency(concours.montantTotal)}</div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-graph-up text-info me-2 fs-5"></i>
                        <div>
                          <div className="small text-muted">Moyen</div>
                          <div className="fw-bold">{formatCurrency(concours.montantMoyen)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-top">
                    {stats.concours.statutPaiementsParConcours.filter(s => s.concours === concours.concours).map(statut => (
                      <div key={statut.concours} className="d-flex gap-2 flex-wrap">
                        <span className="badge bg-success px-3 py-2">
                          <i className="bi bi-check-circle me-1"></i>
                          Succès: {statut.SUCCESS}
                        </span>
                        <span className="badge bg-warning px-3 py-2">
                          <i className="bi bi-clock me-1"></i>
                          En attente: {statut.PENDING}
                        </span>
                        <span className="badge bg-danger px-3 py-2">
                          <i className="bi bi-x-circle me-1"></i>
                          Échoué: {statut.FAILED}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div> <br />

      {/* Section inférieure */}
      <div className="row g-4 mb-5">
        {/* Comptes */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-lg h-100" style={{ borderRadius: '20px' }}>
            <div className="card-header border-0 py-4 px-4" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}>
              <h5 className="mb-0 text-white fw-bold d-flex align-items-center">
                <i className="bi bi-shield-check me-2"></i>
                Comptes Utilisateurs
              </h5>
            </div>
            <div className="card-body p-4">
              <div className="row g-3">
                <div className="col-6">
                  <div className="p-3 rounded-3 text-center" style={{ backgroundColor: '#fee2e2' }}>
                    <i className="bi bi-person-badge-fill text-danger fs-2 mb-2"></i>
                    <div className="fw-bold fs-4 text-danger">{stats.admins.totalAdminsVsCandidats.admins}</div>
                    <div className="small text-muted">Admins</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-3 rounded-3 text-center" style={{ backgroundColor: '#dbeafe' }}>
                    <i className="bi bi-people-fill text-primary fs-2 mb-2"></i>
                    <div className="fw-bold fs-4 text-primary">{stats.admins.totalAdminsVsCandidats.candidats}</div>
                    <div className="small text-muted">Candidats</div>
                  </div>
                </div>
                <div className="col-12 mt-4">
                  <div className="p-3 rounded-3" style={{ backgroundColor: '#f0fdf4', border: '2px solid #86efac' }}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="fw-semibold">Vérifiés</span>
                      <span className="badge bg-success rounded-pill fs-6">{stats.admins.utilisateursVerifies.verifies}</span>
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                      <div className="progress-bar bg-success" style={{ width: `${(stats.admins.utilisateursVerifies.verifies / (stats.admins.utilisateursVerifies.verifies + stats.admins.utilisateursVerifies.nonVerifies)) * 100}%` }}></div>
                    </div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="p-3 rounded-3" style={{ backgroundColor: '#f3f4f6' }}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="fw-semibold">Non vérifiés</span>
                      <span className="badge bg-secondary rounded-pill fs-6">{stats.admins.utilisateursVerifies.nonVerifies}</span>
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                      <div className="progress-bar bg-secondary" style={{ width: `${(stats.admins.utilisateursVerifies.nonVerifies / (stats.admins.utilisateursVerifies.verifies + stats.admins.utilisateursVerifies.nonVerifies)) * 100}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Type de BAC */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-lg h-100" style={{ borderRadius: '20px' }}>
            <div className="card-header border-0 py-4 px-4" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)', borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}>
              <h5 className="mb-0 text-white fw-bold d-flex align-items-center">
                <i className="bi bi-mortarboard-fill me-2"></i>
                Types de Bac
              </h5>
            </div>
            <div className="card-body p-4">
              {stats.candidats.candidatsParTypeBac.map((bac, idx) => (
                <div key={bac.typeExamen} className={`d-flex justify-content-between align-items-center p-3 rounded-3 ${idx > 0 ? 'mt-3' : ''}`} style={{ backgroundColor: '#eef2ff' }}>
                  <span className="fw-semibold text-dark">{bac.typeExamen}</span>
                  <span className="badge rounded-pill px-3 py-2 fs-6" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)', color: 'white' }}>
                    {bac._count.id}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mentions */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-lg h-100" style={{ borderRadius: '20px' }}>
            <div className="card-header border-0 py-4 px-4" style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)', borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}>
              <h5 className="mb-0 text-white fw-bold d-flex align-items-center">
                <i className="bi bi-star-fill me-2"></i>
                Mentions
              </h5>
            </div>
            <div className="card-body p-4">
              {stats.candidats.candidatsParMention.map((mention, idx) => (
                <div key={mention.Mention} className={`d-flex justify-content-between align-items-center p-3 rounded-3 ${idx > 0 ? 'mt-3' : ''}`} style={{ backgroundColor: '#cffafe' }}>
                  <span className="fw-semibold text-dark">{mention.Mention}</span>
                  <span className="badge rounded-pill px-3 py-2 fs-6" style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)', color: 'white' }}>
                    {mention._count.id}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Données supplémentaires AVEC RENDU STRUCTURÉ */}
      <div className="row g-4">
        {/* Dashboard Combiné : RENDU SPÉCIFIQUE */}
        <div className="col-12">
          <div className="card border-0 shadow-lg" style={{ borderRadius: '20px' }}>
            <div className="card-header border-0 py-4 px-4" style={{ background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)', borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}>
              <h5 className="mb-0 text-white fw-bold d-flex align-items-center">
                <i className="bi bi-speedometer2 me-2"></i>
                Vue d'Ensemble du Dashboard (Synthèse)
              </h5>
            </div>
            <div className="card-body p-4">
              {renderDashboardDetails(stats.dashboard)}
            </div>
          </div>
        </div>
      </div>

     

      {/* Footer */}
      <div className="text-center mt-5 pt-4 pb-3">
        <p className="text-muted">
          <i className="bi bi-clock-history me-2"></i>
          Dernière mise à jour : {new Date().toLocaleString('fr-FR')}
        </p>
      </div>
    </div>
  );
}