import React, { useEffect, useState } from 'react';
import StatistiqueService from '../services/StatistiqueService';
import 'bootstrap-icons/font/bootstrap-icons.css';

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return 'N/A';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('XOF', 'FCFA');
};

export default function ReportContent() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    candidats: null,
    geographie: {},
    demographie: {},
    logistique: { centresExamen: [], centresDepot: [] },
    performance: null
  });

  useEffect(() => {
    const fetchAllStats = async () => {
      try {
        setLoading(true);
        const [
          totalCandidats, sexeCandidats, pourcentageSexe, candidatsParSpecialite, candidatsParFiliere,
          candidatsParConcours, statutPaiementsParConcours, candidatsParSession,
          totalPaiements, paiementsParMode, nombrePaiementsStatut, statsRecus,
          totalAdminsVsCandidats, utilisateursVerifies, feedbacksParUtilisateur, 
          notificationsStat, statistiquesTableauDeBord,
          regions, tranchesAge, centresExamen, centresDepot, tauxConversion
        ] = await Promise.all([
          StatistiqueService.totalCandidats(),
          StatistiqueService.sexeCandidats(),
          StatistiqueService.pourcentageSexe(),
          StatistiqueService.candidatsParSpecialite(),
          StatistiqueService.candidatsParFiliere(),
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
          StatistiqueService.candidatsParRegionDetaille(),
          StatistiqueService.candidatsParTrancheAge(),
          StatistiqueService.statsParCentreExamen(),
          StatistiqueService.statsParCentreDepot(),
          StatistiqueService.tauxConversionPaiement()
        ]);

        setStats({
          candidats: { totalCandidats, sexeCandidats, pourcentageSexe, candidatsParSpecialite, candidatsParFiliere },
          geographie: regions || {},
          demographie: tranchesAge || {},
          logistique: { 
            centresExamen: centresExamen || [], 
            centresDepot: centresDepot || [] 
          },
          performance: tauxConversion
        });

      } catch (err) {
        console.error(err);
        setError('Erreur lors du chargement des données.');
      } finally {
        setLoading(false);
      }
    };
    fetchAllStats();
  }, []);

  if (loading) return (
    <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <div className="spinner-border text-primary" role="status" style={{width: '3rem', height: '3rem'}}></div>
      <h5 className="mt-3 fw-light text-secondary">Analyse des flux de données en cours...</h5>
    </div>
  );

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: '#F8F9FC', minHeight: '100vh' }}>
      
      {/* HEADER SECTION */}
      <div className="row align-items-center mb-4">
        <div className="col-md-7">
          <h2 className="fw-bold text-dark mb-1">Tableau de Bord Analytique</h2>
          <p className="text-muted"><i className="bi bi-calendar3 me-2"></i>Données consolidées au {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <div className="row g-4">
        {/* LEFT COLUMN: GEOGRAPHY & LOGISTICS */}
        <div className="col-xl-8">
          
          {/* GEOGRAPHICAL TABLE */}
          <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '15px overflow-hidden' }}>
            <div className="card-header bg-white border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0">
                <span className="p-2 bg-danger-subtle rounded-3 me-2">
                    <i className="bi bi-geo-alt-fill text-danger"></i>
                </span>
                Répartition par Région
              </h5>
              <span className="badge bg-light text-dark border">{Object.keys(stats.geographie).length} Régions</span>
            </div>
            <div className="card-body px-4">
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light text-muted uppercase small">
                    <tr>
                      <th className="border-0">Région</th>
                      <th className="border-0 text-center">Total</th>
                      <th className="border-0">Sexe (F/G)</th>
                      <th className="border-0">Poids (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(stats.geographie).map(([name, data]) => (
                      <tr key={name}>
                        <td className="fw-bold text-dark">{name}</td>
                        <td className="text-center">
                            <span className="fw-bold">{data.total}</span>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <span className="badge rounded-pill bg-danger-subtle text-danger px-3">
                                <i className="bi bi-gender-female me-1"></i>{data.filles}
                            </span>
                            <span className="badge rounded-pill bg-primary-subtle text-primary px-3">
                                <i className="bi bi-gender-male me-1"></i>{data.garcons}
                            </span>
                          </div>
                        </td>
                        <td style={{ width: '200px' }}>
                          <div className="d-flex align-items-center gap-2">
                            <div className="progress flex-grow-1" style={{ height: '8px', borderRadius: '10px' }}>
                              <div 
                                className="progress-bar bg-primary" 
                                style={{ width: `${(data.total / stats.candidats?.totalCandidats) * 100}%` }}
                              ></div>
                            </div>
                            <small className="text-muted fw-bold">
                                {Math.round((data.total / stats.candidats?.totalCandidats) * 100)}%
                            </small>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* EXAM CENTERS */}
          <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '15px' }}>
            <div className="card-header bg-white border-0 pt-4 px-4">
              <h5 className="fw-bold mb-0">
                <span className="p-2 bg-info-subtle rounded-3 me-2">
                    <i className="bi bi-building-fill text-info"></i>
                </span>
                Capacité des Centres d'Examen
              </h5>
            </div>
            <div className="card-body p-4">
              <div className="row g-3">
                {stats.logistique.centresExamen.map((centre, idx) => (
                  <div className="col-md-6" key={idx}>
                    <div className="p-3 border rounded-4 bg-white hover-shadow transition-all" style={{borderStyle: 'dashed !important'}}>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="fw-bold mb-0 text-truncate" style={{maxWidth: '70%'}}>{centre.centre}</h6>
                        <span className="badge bg-primary">{centre.total} inscrits</span>
                      </div>
                      <div className="d-flex gap-3 small text-muted">
                        <span><i className="bi bi-person-fill text-danger opacity-50"></i> {centre.filles} F</span>
                        <span><i className="bi bi-person-fill text-primary opacity-50"></i> {centre.garcons} G</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AGE & DEPOTS */}
        <div className="col-xl-4">
          
          {/* AGE PYRAMID (DARK MODE CARD) */}
          <div className="card border-0 shadow-lg mb-4" style={{ 
            borderRadius: '20px', 
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            minHeight: '400px'
          }}>
            <div className="card-body p-4 text-white">
              <div className="d-flex align-items-center mb-4">
                <i className="bi bi-person-bounding-box fs-4 me-3 text-info"></i>
                <h5 className="fw-bold mb-0">Pyramide des âges</h5>
              </div>
              
              <div className="mt-4">
                  {Object.entries(stats.demographie).map(([tranche, count]) => (
                    <div className="mb-4" key={tranche}>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="small text-light opacity-75">{tranche} ans</span>
                        <span className="small fw-bold text-info">{count} candidats</span>
                      </div>
                      <div className="progress bg-dark" style={{ height: '10px', borderRadius: '20px' }}>
                        <div 
                            className="progress-bar bg-info" 
                            style={{ 
                                width: `${(count / stats.candidats?.totalCandidats) * 100}%`,
                                boxShadow: '0 0 10px rgba(13, 202, 240, 0.5)'
                            }}
                        ></div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* SUBMISSION CENTERS */}
          <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
            <div className="card-header bg-white border-0 pt-4 px-4">
              <h5 className="fw-bold mb-0 text-center">Réception des Dossiers</h5>
            </div>
            <div className="card-body p-0">
              <div className="list-group list-group-flush mt-2">
                {stats.logistique.centresDepot.map((depot, idx) => (
                  <div className="list-group-item d-flex justify-content-between align-items-center border-0 py-3 px-4" key={idx}>
                    <div className="d-flex align-items-center">
                        <div className="bg-warning-subtle p-2 rounded-3 me-3">
                            <i className="bi bi-folder-fill text-warning"></i>
                        </div>
                        <div>
                            <div className="fw-bold text-dark small">{depot.nom}</div>
                            <div className="text-muted" style={{fontSize: '0.75rem'}}>{depot.lieu}</div>
                        </div>
                    </div>
                    <span className="badge bg-dark rounded-pill">{depot.nbDossiers}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
      
      {/* CSS ADDITIONNEL (à mettre dans votre fichier .css) */}
      <style>{`
        .bg-light-primary { background-color: #eef2ff; }
        .hover-shadow:hover { box-shadow: 0 5px 15px rgba(0,0,0,0.05); transform: translateY(-2px); }
        .transition-all { transition: all 0.3s ease; }
        .bg-danger-subtle { background-color: #fee2e2; }
        .bg-primary-subtle { background-color: #e0e7ff; }
        .bg-info-subtle { background-color: #e0f2fe; }
        .bg-warning-subtle { background-color: #fef3c7; }
      `}</style>
    </div>
  );
}