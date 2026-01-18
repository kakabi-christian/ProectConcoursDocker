import React, { useState, useEffect, useCallback } from 'react';
import { 
  BiSearch, BiCheckCircle, BiXCircle, 
  BiTimeFive, BiShow, BiLoaderAlt, BiChevronLeft,
  BiMessageDetail, BiUser, BiInfoCircle, BiFile
} from 'react-icons/bi';
import { 
  getAllDossiers, 
  updateDossierStatus, 
  DOSSIER_STATUS, 
  getFileUrl 
} from '../services/DossierService';

const DossierAdmnContent = () => {
  // --- ÉTATS ---
  const [dossiers, setDossiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDossier, setSelectedDossier] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  const [filters, setFilters] = useState({ page: 1, limit: 10, statut: '' });
  const [pagination, setPagination] = useState({ total: 0, page: 1, lastPage: 1 });

  const [adminComment, setAdminComment] = useState('');
  const [commentError, setCommentError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // --- CHARGEMENT DES DONNÉES ---
  const loadDossiers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAllDossiers(filters);
      const data = response.data?.data || response.data || [];
      setDossiers(data);
      if (response.data?.pagination) setPagination(response.data.pagination);
    } catch (error) {
      console.error("Erreur chargement dossiers", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadDossiers();
  }, [loadDossiers]);

  // --- LOGIQUE DE RÉSOLUTION DYNAMIQUE DES FICHIERS ---
  const resolveFileUrl = (dossier, code) => {
    if (!dossier || !code) return null;
    
    const search = code.toLowerCase().trim();
    const keys = Object.keys(dossier);

    const foundKey = keys.find(k => {
      const keyLower = k.toLowerCase();
      return (
        keyLower === search || 
        keyLower === `photo${search}` || 
        `photo${keyLower}` === search
      );
    });
    
    return foundKey ? dossier[foundKey] : null;
  };

  // --- ACTIONS ---
  const handleOpenValidation = (dossier) => {
    setSelectedDossier(dossier);
    setAdminComment(dossier.commentaire || '');
    setShowModal(true);
  };

  const handleUpdateStatus = async (newStatus) => {
    // 1. Vérification si le dossier est déjà validé
    if (selectedDossier.statut === DOSSIER_STATUS.VALIDATED && newStatus === DOSSIER_STATUS.VALIDATED) {
      alert("Ce dossier est déjà validé. Vous ne pouvez pas effectuer cette action à nouveau.");
      return;
    }

    // 2. Logique de validation obligatoire du commentaire pour rejet
    if (newStatus === DOSSIER_STATUS.REJECTED && !adminComment.trim()) {
      setCommentError(true);
      alert("Action requise : Veuillez saisir obligatoirement un motif de refus.");
      return;
    }

    // 3. Message de confirmation avant traitement
    const confirmMessage = newStatus === DOSSIER_STATUS.VALIDATED 
      ? `Voulez-vous vraiment CONFIRMER la validation du dossier de ${selectedDossier.candidate?.user?.nom} ?`
      : `Voulez-vous vraiment REJETER le dossier de ${selectedDossier.candidate?.user?.nom} ?`;

    if (!window.confirm(confirmMessage)) {
      return; // Annule l'opération si l'admin clique sur "Annuler"
    }

    setSubmitting(true);
    try {
      await updateDossierStatus(selectedDossier.candidateId, {
        statut: newStatus,
        commentaire: adminComment
      });
      
      window.dispatchEvent(new Event("dossierStatusUpdated"));

      setShowModal(false);
      loadDossiers();
      setCommentError(false);
    } catch (error) {
      alert("Erreur lors de la mise à jour du statut.");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case DOSSIER_STATUS.VALIDATED: return <span className="badge bg-success-subtle text-success border border-success-subtle"><BiCheckCircle className="me-1"/>Validé</span>;
      case DOSSIER_STATUS.REJECTED: return <span className="badge bg-danger-subtle text-danger border border-danger-subtle"><BiXCircle className="me-1"/>Rejeté</span>;
      default: return <span className="badge bg-warning-subtle text-warning border border-warning-subtle"><BiTimeFive className="me-1"/>En attente</span>;
    }
  };

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Validation des Dossiers</h2>
          <p className="text-muted small">Examinez les pièces justificatives par concours</p>
        </div>
      </div>

      <div className="card shadow-sm border-0 mb-4 p-3">
        <div className="row g-3">
          <div className="col-md-8">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0"><BiSearch /></span>
              <input type="text" className="form-control border-start-0" placeholder="Rechercher un candidat..." />
            </div>
          </div>
          <div className="col-md-4">
            <select className="form-select" value={filters.statut} onChange={(e) => setFilters({...filters, statut: e.target.value, page: 1})}>
              <option value="">Tous les statuts</option>
              <option value={DOSSIER_STATUS.PENDING}>En attente</option>
              <option value={DOSSIER_STATUS.VALIDATED}>Validés</option>
              <option value={DOSSIER_STATUS.REJECTED}>Rejetés</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light text-muted">
              <tr>
                <th className="px-4">CANDIDAT</th>
                <th>CONCOURS</th>
                <th>STATUT</th>
                <th>DERNIÈRE MAJ</th>
                <th className="text-end px-4">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center py-5"><BiLoaderAlt className="spinner-border text-primary" /></td></tr>
              ) : dossiers.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-5">Aucun dossier trouvé</td></tr>
              ) : dossiers.map((d) => (
                <tr key={d.id}>
                  <td className="px-4">
                    <div className="d-flex align-items-center">
                      <div className="bg-primary-subtle text-primary rounded-circle p-2 me-3"><BiUser size={20}/></div>
                      <div>
                        <div className="fw-bold">{d.candidate?.user?.nom} {d.candidate?.user?.prenom}</div>
                        <small className="text-muted">{d.candidate?.user?.email}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="fw-medium text-primary">
                      {d.concours?.intitule || "Concours non défini"}
                    </span>
                  </td>
                  <td>{getStatusBadge(d.statut)}</td>
                  <td className="small text-muted">{new Date(d.updatedAt).toLocaleDateString()}</td>
                  <td className="text-end px-4">
                    <button className="btn btn-primary btn-sm rounded-pill" onClick={() => handleOpenValidation(d)}>
                      <BiShow className="me-1"/> Examiner
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card-footer bg-white border-0 d-flex justify-content-between align-items-center p-3">
          <small className="text-muted">Page {pagination.page} / {pagination.lastPage}</small>
          <div className="btn-group">
            <button className="btn btn-sm btn-outline-secondary" disabled={pagination.page <= 1} onClick={() => setFilters(f => ({...f, page: f.page - 1}))}><BiChevronLeft/></button>
            <button className="btn btn-sm btn-outline-primary" disabled={pagination.page >= pagination.lastPage} onClick={() => setFilters(f => ({...f, page: f.page + 1}))}>Suivant</button>
          </div>
        </div>
      </div>

      {showModal && selectedDossier && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1050 }}>
          <div className="modal-dialog modal-xl modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-dark text-white">
                <h5 className="modal-title">Dossier : {selectedDossier.candidate?.user?.nom} - {selectedDossier.concours?.intitule}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body p-0 bg-light">
                <div className="row g-0">
                  <div className="col-md-8 p-4" style={{maxHeight: '80vh', overflowY: 'auto'}}>
                    <div className="alert alert-info d-flex align-items-center mb-4 border-0 shadow-sm">
                      <BiInfoCircle className="me-2" size={20}/>
                      <div>
                        <strong>Pièces exigées :</strong> 
                        <span className="ms-1">{selectedDossier.piecesRequises?.map(p => p.nom).join(', ')}</span>
                      </div>
                    </div>

                    <div className="row g-3">
                      {selectedDossier.piecesRequises?.map((piece, idx) => {
                        const fileUrl = resolveFileUrl(selectedDossier, piece.code);
                        return (
                          <div key={idx} className="col-md-6">
                            <div className="card border-0 shadow-sm h-100">
                              <div className="card-header bg-white py-2 fw-bold small text-uppercase text-muted">
                                <BiFile className="me-1"/> {piece.nom} <span className="text-lowercase text-info">({piece.code})</span>
                              </div>
                              <div className="card-body p-2 text-center">
                                {fileUrl ? (
                                  <div className="position-relative">
                                    <img 
                                      src={getFileUrl(fileUrl)} 
                                      alt={piece.nom} 
                                      className="img-fluid rounded border" 
                                      style={{ maxHeight: '250px', width: '100%', objectFit: 'contain' }} 
                                    />
                                    <div className="mt-2">
                                        <a href={getFileUrl(fileUrl)} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-dark w-100">
                                            <BiShow className="me-1"/> Voir en grand
                                        </a>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="py-5 bg-white text-danger small">
                                    <BiXCircle size={24} className="mb-2"/><br/>
                                    <strong>{piece.nom}</strong> non détecté.<br/>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="col-md-4 p-4 bg-white border-start">
                    <h6 className="fw-bold mb-3 text-uppercase small text-muted">Décision finale</h6>
                    <div className="mb-4">
                      <label className={`form-label small fw-bold ${commentError ? 'text-danger' : ''}`}>
                        Commentaire / Motif du refus {commentError && "(Obligatoire pour un rejet)"}
                      </label>
                      <textarea 
                        className={`form-control ${commentError ? 'is-invalid border-danger' : ''}`} 
                        rows="10" 
                        placeholder="Exemple : Votre acte de naissance est illisible..."
                        value={adminComment}
                        onChange={(e) => {
                          setAdminComment(e.target.value);
                          if (e.target.value.trim()) setCommentError(false);
                        }}
                      ></textarea>
                      {commentError && <div className="text-danger small mt-1">Veuillez préciser la raison du rejet.</div>}
                    </div>

                    <div className="d-grid gap-2">
                      <button 
                        className="btn btn-success py-3 fw-bold shadow-sm" 
                        onClick={() => handleUpdateStatus(DOSSIER_STATUS.VALIDATED)}
                        disabled={submitting}
                      >
                        {submitting ? <BiLoaderAlt className="spinner-border spinner-border-sm me-2"/> : <BiCheckCircle className="me-2"/>}
                        VALIDER LE DOSSIER
                      </button>
                      <button 
                        className="btn btn-danger py-3 fw-bold shadow-sm" 
                        onClick={() => handleUpdateStatus(DOSSIER_STATUS.REJECTED)}
                        disabled={submitting}
                      >
                        <BiXCircle className="me-2"/> REJETER LE DOSSIER
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DossierAdmnContent;