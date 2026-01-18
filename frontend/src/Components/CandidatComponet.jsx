import React, { useState, useEffect, useCallback } from 'react';
import { 
  BiSearch, BiUser, BiLoaderAlt, BiArrowBack, BiCreditCard,
  BiBuilding, BiBook, BiGroup, BiCheckCircle, BiDownload, BiMap, BiFlag, BiLayer, BiTrophy
} from 'react-icons/bi';

import candidatService from '../services/candidatService';

const InfoField = ({ label, value, icon: Icon }) => (
  <div className="col-lg-4 col-md-6 mb-4">
    <div className="p-3 border rounded h-100 shadow-sm" style={{ backgroundColor: '#f0f4f8', borderColor: '#d9e2ec' }}>
      <div className="d-flex align-items-center">
        <Icon className="me-3 text-primary fs-5" /> 
        <div>
          <small className="text-muted text-uppercase fw-bold d-block" style={{ fontSize: '0.7rem' }}>{label}</small>
          <p className="mb-0 fw-semibold text-dark text-break">
            {value || <span className="text-danger fst-italic">Non renseigné</span>}
          </p>
        </div>
      </div>
    </div>
  </div>
);

const CandidatComponent = () => {
  const [candidates, setCandidates] = useState([]);
  const [concours, setConcours] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [filieres, setFilieres] = useState([]);
  const [specialites, setSpecialites] = useState([]);
  const [centresExamen, setCentresExamen] = useState([]); 
  const [centresDepot, setCentresDepot] = useState([]);   
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
  const [pagination, setPagination] = useState({ total: 0, page: 1, lastPage: 1 });
  
  const [filters, setFilters] = useState({ 
    search: '', 
    concoursId: '', 
    sessionId: '',
    filiereId: '', 
    specialiteId: '', 
    centreExamenId: '', 
    centreDepotId: '', 
    sexe: '', 
    statut: '', 
    page: 1, 
    limit: 10 
  });
  
  const [selectedCandidat, setSelectedCandidat] = useState(null);

  // 1. CHARGEMENT INITIAL
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [concoursRes, filieresRes, examRes, depotRes] = await Promise.all([
          candidatService.getConcours ? candidatService.getConcours() : Promise.resolve([]),
          candidatService.getFilieres(),
          candidatService.getCentresExamen(),
          candidatService.getCentresDepot()
        ]);
        
        const extractArray = (res) => {
            if (Array.isArray(res)) return res;
            if (res && Array.isArray(res.data)) return res.data;
            return [];
        };

        setConcours(extractArray(concoursRes));
        setFilieres(extractArray(filieresRes));
        setCentresExamen(extractArray(examRes));
        setCentresDepot(extractArray(depotRes));
      } catch (err) { 
        console.error("Erreur chargement données initiales:", err); 
      }
    };
    fetchInitialData();
  }, []);

  // 2. CHARGEMENT DES CANDIDATS
  const loadCandidates = useCallback(async () => {
    setLoading(true);
    try {
      const result = await candidatService.getDetailedList(filters);
      if (result) {
        setCandidates(result.candidates || []);
        setPagination(result.pagination || { total: 0, page: 1, lastPage: 1 });
      }
    } catch (err) {
      console.error("Erreur chargement candidats:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => { if (!selectedCandidat) loadCandidates(); }, 400);
    return () => clearTimeout(timer);
  }, [loadCandidates, selectedCandidat]);

  // 3. ACTIONS
  const handleDispatch = async () => {
    if (!filters.concoursId || !filters.centreExamenId) {
      alert("Veuillez sélectionner un Concours et un Centre d'Examen.");
      return;
    }

    const confirmAction = window.confirm("Lancer la répartition automatique ?");
    if (!confirmAction) return;

    setIsDispatching(true);
    try {
      await candidatService.runDispatching({
        concoursId: filters.concoursId,
        sessionId: filters.sessionId,
        centreExamenId: filters.centreExamenId,
        specialiteId: filters.specialiteId 
      });
      alert("Le dispatching a été effectué avec succès !");
      loadCandidates();
    } catch (err) {
      alert("Erreur lors du dispatching : " + (err.response?.data?.message || err.message));
    } finally {
      setIsDispatching(false);
    }
  };

  const handleFilterChange = async (e) => {
    const { name, value } = e.target;
    
    if (name === 'concoursId') {
      setFilters(prev => ({ ...prev, concoursId: value, sessionId: '', page: 1 }));
      if (value && candidatService.getSessionsByConcours) {
        const sess = await candidatService.getSessionsByConcours(value);
        setSessions(Array.isArray(sess) ? sess : (sess?.data || []));
      } else {
        setSessions([]);
      }
    } else if (name === 'filiereId') {
      setFilters(prev => ({ ...prev, filiereId: value, specialiteId: '', page: 1 }));
      if (value) {
        const specs = await candidatService.getSpecialitesByFiliere(value);
        setSpecialites(Array.isArray(specs) ? specs : (specs?.data || []));
      } else {
        setSpecialites([]);
      }
    } else {
      setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.lastPage) {
      setFilters(prev => ({ ...prev, page: newPage }));
    }
  };

  const getStatusBadge = (statut) => {
    switch (statut) {
      case 'VALIDATED': return <span className="badge bg-success">Validé</span>;
      case 'REJECTED': return <span className="badge bg-danger">Rejeté</span>;
      default: return <span className="badge bg-warning text-dark">En attente</span>;
    }
  };

  if (selectedCandidat) {
    return (
      <div className="container-fluid p-4 bg-light min-vh-100">
        <button className="btn btn-outline-primary mb-4 shadow-sm rounded-pill px-4" onClick={() => setSelectedCandidat(null)}>
          <BiArrowBack className="me-2" /> Retour à la liste
        </button>
        <div className="card shadow border-0 p-4 rounded-4">
            <h3 className="fw-bold mb-4 text-primary">Détails du Candidat</h3>
            <div className="row">
                <InfoField label="Nom complet" value={`${selectedCandidat.nom} ${selectedCandidat.prenom}`} icon={BiUser} />
                <InfoField label="Matricule" value={selectedCandidat.matricule} icon={BiCreditCard} />
                <InfoField label="Filière" value={selectedCandidat.filiere} icon={BiBuilding} />
                <InfoField label="Spécialité" value={selectedCandidat.specialite} icon={BiBook} />
                <InfoField label="Centre d'Examen" value={selectedCandidat.centreExamen} icon={BiMap} />
                <InfoField label="Salle / Table" value={selectedCandidat.salle ? `${selectedCandidat.salle} (Table ${selectedCandidat.numeroTable})` : 'Non assigné'} icon={BiLayer} />
                <InfoField label="Sexe" value={selectedCandidat.sexe} icon={BiGroup} />
                <InfoField label="Statut" value={selectedCandidat.dossier?.statut === 'VALIDATED' ? 'Validé' : 'En attente'} icon={BiCheckCircle} />
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4 bg-light min-vh-100">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Portail Gestion Candidats</h2>
          <p className="text-muted mb-0">Filtrage par concours, session et répartition</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-primary rounded-pill px-4 shadow-sm fw-bold" onClick={handleDispatch} disabled={isDispatching || !filters.concoursId}>
            {isDispatching ? <BiLoaderAlt className="spinner-border spinner-border-sm me-2" /> : <BiLayer className="me-2" />}
            Lancer Dispatching
          </button>
          <button className="btn btn-danger rounded-pill px-4 shadow-sm fw-bold" onClick={() => candidatService.exportToPdf(filters)} disabled={isExporting}>
            <BiDownload className="me-2" /> Export PDF
          </button>
        </div>
      </div>

      {/* ZONE DE FILTRES */}
      <div className="card shadow-sm border-0 mb-4 p-3 rounded-4">
        <div className="row g-3">
          <div className="col-md-3">
            <div className="input-group">
              <span className="input-group-text bg-light text-primary"><BiTrophy /></span>
              <select
                className="form-select shadow-none border-primary fw-bold text-dark"
                style={{ backgroundColor: "#ffffff", color: "#212529" }}
                name="concoursId"
                value={filters.concoursId}
                onChange={handleFilterChange}
              >
                <option value="" style={{ color: "#6c757d", backgroundColor: "#ffffff" }}>-- Concours --</option>
                {concours.map(c => (
                  <option key={c.id} value={c.id} style={{ color: "#212529", backgroundColor: "#ffffff" }}>
                    {c.intitule || c.nom || c.libelle || c.code}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="col-md-3">
             <select className="form-select shadow-none" name="sessionId" value={filters.sessionId} onChange={handleFilterChange} disabled={!filters.concoursId}>
                <option value="">-- Toutes les Sessions --</option>
                {sessions.map(s => <option key={s.id} value={s.id}>{s.nom || s.annee}</option>)}
              </select>
          </div>

          <div className="col-md-3">
            <select className="form-select shadow-none" name="filiereId" value={filters.filiereId} onChange={handleFilterChange}>
              <option value="">-- Toutes les filières --</option>
              {filieres.map(f => <option key={f.id} value={f.id}>{f.intitule || f.libelle}</option>)}
            </select>
          </div>

          <div className="col-md-3">
            <select className="form-select shadow-none" name="specialiteId" value={filters.specialiteId} onChange={handleFilterChange} disabled={!filters.filiereId}>
              <option value="">-- Spécialité --</option>
              {specialites.map(s => <option key={s.id} value={s.id}>{s.libelle || s.intitule}</option>)}
            </select>
          </div>

          <div className="col-md-3">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-primary"><BiSearch /></span>
              <input type="text" name="search" className="form-control border-start-0 shadow-none" placeholder="Rechercher nom..." value={filters.search} onChange={handleFilterChange} />
            </div>
          </div>

          <div className="col-md-3">
            <select className="form-select shadow-none border-info" name="centreExamenId" value={filters.centreExamenId} onChange={handleFilterChange}>
              <option value="">-- Centre Examen --</option>
              {centresExamen.map(c => <option key={c.id} value={c.id}>{c.intitule || c.nom}</option>)}
            </select>
          </div>

          <div className="col-md-3">
            <select className="form-select shadow-none" name="sexe" value={filters.sexe} onChange={handleFilterChange}>
              <option value="">-- Tous les sexes --</option>
              <option value="MASCULIN">Masculin</option>
              <option value="FEMININ">Féminin</option>
            </select>
          </div>

          <div className="col-md-3">
            <select className="form-select shadow-none text-primary fw-bold" name="statut" value={filters.statut} onChange={handleFilterChange}>
              <option value="">-- Tous les statuts --</option>
              <option value="VALIDATED">VALIDÉ</option>
              <option value="PENDING">EN ATTENTE</option>
              <option value="REJECTED">REJETÉ</option>
            </select>
          </div>
        </div>
      </div>

      {/* TABLEAU */}
      <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-primary text-white">
              <tr>
                <th className="px-4 py-3 border-0">CANDIDAT / SEXE</th>
                <th className="py-3 border-0 text-center">SALLE / TABLE</th>
                <th className="py-3 border-0 text-center">STATUT</th>
                <th className="py-3 border-0">FILIÈRE / SPÉCIALITÉ</th>
                <th className="text-end px-4 py-3 border-0">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center py-5"><BiLoaderAlt className="spinner-border text-primary" /></td></tr>
              ) : candidates.length > 0 ? (
                candidates.map((c) => (
                  <tr key={c.id}>
                    <td className="px-4">
                      <div className="d-flex align-items-center">
                        <div className="bg-primary-subtle rounded-circle p-2 me-3 text-primary"><BiUser size={20} /></div>
                        <div>
                          <div className="fw-bold">{c.nom} {c.prenom}</div>
                          <small className="text-muted">{c.matricule} ({c.sexe})</small>
                        </div>
                      </div>
                    </td>
                    <td className="text-center">
                      <div className="fw-bold text-primary">{c.salle || '---'}</div>
                      <small className="text-muted">{c.numeroTable ? `Place: ${c.numeroTable}` : ''}</small>
                    </td>
                    <td className="text-center">{getStatusBadge(c.dossier?.statut)}</td>
                    <td>
                      <div className="small text-dark fw-bold">{c.filiere}</div>
                      <div className="text-primary" style={{fontSize: '0.8rem'}}>{c.specialite}</div>
                    </td>
                    <td className="text-end px-4">
                      <button className="btn btn-primary btn-sm rounded-pill px-3" onClick={() => setSelectedCandidat(c)}>Profil</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="text-center py-5 text-muted">Aucun candidat trouvé pour ces filtres.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION */}
      {pagination.lastPage > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-4 px-2">
          <div className="text-muted small">
            Affichage de <b>{candidates.length}</b> sur <b>{pagination.total}</b> candidats
          </div>
          <nav>
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                <button className="page-link shadow-none" onClick={() => handlePageChange(pagination.page - 1)}>Précédent</button>
              </li>
              {[...Array(pagination.lastPage)].map((_, i) => (
                <li key={i + 1} className={`page-item ${pagination.page === i + 1 ? 'active' : ''}`}>
                  <button className="page-link shadow-none" onClick={() => handlePageChange(i + 1)}>{i + 1}</button>
                </li>
              ))}
              <li className={`page-item ${pagination.page === pagination.lastPage ? 'disabled' : ''}`}>
                <button className="page-link shadow-none" onClick={() => handlePageChange(pagination.page + 1)}>Suivant</button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
};

export default CandidatComponent;