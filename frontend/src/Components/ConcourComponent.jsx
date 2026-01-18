import React, { useState, useEffect, useCallback } from 'react';
import { 
  BiSearch, BiChevronLeft, BiPlus, BiEditAlt, 
  BiTrash, BiLoaderAlt, BiCheck, BiErrorCircle,
  BiWallet, BiCalendar, BiLayer, BiFile, BiTimeFive
} from 'react-icons/bi';
import { 
  getConcours, 
  createConcours, 
  updateConcours, 
  deleteConcours 
} from '../services/concoursService';
import anneeService from '../services/anneeService';
import sessionService from '../services/sessionService';
import pieceDossierService from '../services/PieceDossierService';

const ConcoursComponent = () => {
  // 1. ÉTATS DE BASE
  const [filters, setFilters] = useState({ search: '', page: 1, limit: 10 });
  const [pagination, setPagination] = useState({ total: 0, page: 1, lastPage: 1 });
  const [notification, setNotification] = useState({ show: false, title: '', message: '', type: 'error' });
  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null });

  // 2. ÉTATS DE DONNÉES
  const [items, setItems] = useState([]);
  const [annees, setAnnees] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [availablePieces, setAvailablePieces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.userType === 'ADMIN'|| user.userType === 'SUPERADMIN';

  // 3. ÉTATS DU FORMULAIRE
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({ 
    code: '', 
    intitule: '', 
    montant: '',
    statut: 'PLANIFIE',
    dateDebutInscription: '',
    dateFinInscription: '',
    anneeId: '',
    sessionId: '',
    pieceDossierIds: [] 
  });

  // 4. LES FONCTIONS
  const showNotify = (title, message, type = 'error') => {
    setNotification({ show: true, title, message, type });
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getConcours(filters);
      const dataArray = response.data?.data || response.data || [];
      setItems(dataArray);
      if (response.data?.pagination) {
        setPagination(response.data.pagination);
      }
    } catch (err) {
      showNotify("Erreur", "Impossible de charger les concours.", "error");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadOptions = async () => {
    try {
      const [resAnnee, resSession, resPieces] = await Promise.all([
        anneeService.getAll(),
        sessionService.getAll(),
        pieceDossierService.findAll()
      ]);
      setAnnees(resAnnee.data?.data || resAnnee.data || []);
      setSessions(resSession.data?.data || resSession.data || []);
      setAvailablePieces(resPieces || []);
    } catch (err) {
      console.error("Erreur options", err);
    }
  };

  useEffect(() => { loadOptions(); }, []);
  
  useEffect(() => {
    const timer = setTimeout(() => loadData(), 400);
    return () => clearTimeout(timer);
  }, [loadData]);

  // --- LOGIQUE HANDLERS ---
  const handlePieceChange = (pieceId) => {
    setFormData(prev => {
      const currentIds = [...prev.pieceDossierIds];
      return {
        ...prev,
        pieceDossierIds: currentIds.includes(pieceId)
          ? currentIds.filter(id => id !== pieceId)
          : [...currentIds, pieceId]
      };
    });
  };

  const openModal = (concours = null) => {
    if (!isAdmin) return;
    if (concours) {
      setIsEditing(true);
      setCurrentId(concours.id);
      setFormData({ 
        code: concours.code, 
        intitule: concours.intitule, 
        montant: concours.montant || '',
        statut: concours.statut || 'PLANIFIE',
        // On formate les dates pour l'input HTML (YYYY-MM-DD)
        dateDebutInscription: concours.dateDebutInscription ? concours.dateDebutInscription.split('T')[0] : '',
        dateFinInscription: concours.dateFinInscription ? concours.dateFinInscription.split('T')[0] : '',
        anneeId: concours.anneeId || '',
        sessionId: concours.sessionId || '',
        pieceDossierIds: concours.piecesDossier?.map(p => p.id) || []
      });
    } else {
      setIsEditing(false);
      setFormData({ 
        code: '', intitule: '', montant: '', statut: 'PLANIFIE', 
        dateDebutInscription: '', dateFinInscription: '', 
        anneeId: '', sessionId: '', pieceDossierIds: [] 
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const dataToSend = { ...formData, montant: parseFloat(formData.montant) };
      if (isEditing) await updateConcours(currentId, dataToSend);
      else await createConcours(dataToSend);
      
      setShowModal(false);
      loadData();
      showNotify("Succès", "Enregistrement réussi", "success");
    } catch (err) {
      showNotify("Erreur", "Vérifiez vos données (Code unique).");
    } finally {
      setSubmitting(false);
    }
  };

  const executeDelete = async () => {
    try {
      await deleteConcours(confirmDelete.id);
      setConfirmDelete({ show: false, id: null });
      loadData();
      showNotify("Supprimé", "Concours retiré avec succès.", "success");
    } catch (err) {
      showNotify("Erreur", "Suppression impossible.");
    }
  };

  // Helper pour les badges de statut
  const getStatusBadge = (statut) => {
    const config = {
      PLANIFIE: 'bg-secondary',
      OUVERT: 'bg-success',
      FERME: 'bg-danger',
      TERMINE: 'bg-dark'
    };
    return <span className={`badge ${config[statut] || 'bg-secondary'} px-2 py-1`}>{statut}</span>;
  };

  return (
    <div className="container-fluid p-4 bg-light min-vh-100">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Gestion des Concours</h2>
          <p className="text-muted small">Configurez les types de concours, périodes et pièces requises</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary d-flex align-items-center shadow-sm px-4" onClick={() => openModal()}>
            <BiPlus className="me-2" /> Nouveau Concours
          </button>
        )}
      </div>

      {/* RECHERCHE */}
      <div className="card shadow-sm border-0 mb-4 p-3">
        <div className="input-group w-50">
          <span className="input-group-text bg-white border-end-0"><BiSearch /></span>
          <input 
            type="text" className="form-control border-start-0 shadow-none" 
            placeholder="Rechercher par code ou intitulé..." 
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
          />
        </div>
      </div>

      {/* TABLEAU */}
      <div className="card shadow-sm border-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-primary text-white">
              <tr>
                <th className="px-4 py-3">CODE / INTITULÉ</th>
                <th className="py-3">STATUT / DATES</th>
                <th className="py-3">FRAIS</th>
                <th className="py-3">PIÈCES REQUISES</th>
                <th className="py-3">ANNÉE / SESSION</th>
                {isAdmin && <th className="text-end px-4">ACTIONS</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center py-5"><BiLoaderAlt className="spinner-border text-primary" /></td></tr>
              ) : items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4">
                    <span className="fw-bold text-primary">{item.code}</span><br/>
                    <small className="text-dark fw-semibold">{item.intitule}</small>
                  </td>
                  <td>
                    {getStatusBadge(item.statut)}<br/>
                    <small className="text-muted"><BiTimeFive className="me-1"/> 
                      {item.dateDebutInscription ? new Date(item.dateDebutInscription).toLocaleDateString() : 'N/A'} - 
                      {item.dateFinInscription ? new Date(item.dateFinInscription).toLocaleDateString() : '...'}
                    </small>
                  </td>
                  <td>
                    <BiWallet className="me-1 text-muted"/>
                    {item.montant?.toLocaleString()} <small className="text-muted">FCFA</small>
                  </td>
                  <td>
                    <div className="d-flex flex-wrap gap-1" style={{maxWidth: '200px'}}>
                      {item.piecesDossier?.map(p => (
                        <span key={p.id} className="badge bg-info text-white" style={{fontSize: '9px'}}>{p.nom}</span>
                      )) || <span className="text-muted small">Aucune</span>}
                    </div>
                  </td>
                  <td>
                    <div className="small text-muted">
                      <BiCalendar className="me-1"/> {item.annee?.libelle}<br/>
                      <BiLayer className="me-1"/> {item.session?.nom}
                    </div>
                  </td>
                  {isAdmin && (
                    <td className="text-end px-4">
                      <button className="btn btn-sm btn-light border me-2" onClick={() => openModal(item)}><BiEditAlt className="text-warning" /></button>
                      <button className="btn btn-sm btn-light border" onClick={() => setConfirmDelete({ show: true, id: item.id })}><BiTrash className="text-danger" /></button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* PAGINATION */}
        <div className="card-footer bg-white d-flex justify-content-between align-items-center">
          <small className="text-muted">Page {pagination.page} sur {pagination.lastPage}</small>
          <div className="btn-group">
            <button className="btn btn-sm btn-outline-secondary" disabled={pagination.page <= 1} onClick={() => setFilters(f => ({...f, page: f.page - 1}))}><BiChevronLeft/></button>
            <button className="btn btn-sm btn-primary" disabled={pagination.page >= pagination.lastPage} onClick={() => setFilters(f => ({...f, page: f.page + 1}))}>Suivant</button>
          </div>
        </div>
      </div>

      {/* MODAL FORMULAIRE */}
      {showModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1050 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <form onSubmit={handleSubmit}>
                <div className="modal-header bg-dark text-white border-0">
                  <h5 className="modal-title">{isEditing ? 'Modifier' : 'Nouveau'} Concours</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">CODE</label>
                      <input type="text" className="form-control" required value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})} />
                    </div>
                    <div className="col-md-8">
                      <label className="form-label small fw-bold">INTITULÉ</label>
                      <input type="text" className="form-control" required value={formData.intitule} onChange={(e) => setFormData({...formData, intitule: e.target.value})} />
                    </div>

                    {/* NOUVEAUX CHAMPS : DATES ET STATUT */}
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">DÉBUT INSCRIPTION</label>
                      <input type="date" className="form-control" value={formData.dateDebutInscription} onChange={(e) => setFormData({...formData, dateDebutInscription: e.target.value})} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">FIN INSCRIPTION</label>
                      <input type="date" className="form-control" value={formData.dateFinInscription} onChange={(e) => setFormData({...formData, dateFinInscription: e.target.value})} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">STATUT</label>
                      <select className="form-select" value={formData.statut} onChange={(e) => setFormData({...formData, statut: e.target.value})}>
                        <option value="PLANIFIE">PLANIFIÉ</option>
                        <option value="OUVERT">OUVERT</option>
                        <option value="FERME">FERMÉ</option>
                        <option value="TERMINE">TERMINÉ</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-bold">ANNÉE ACADÉMIQUE</label>
                      <select className="form-select" required value={formData.anneeId} onChange={(e) => setFormData({...formData, anneeId: e.target.value})}>
                        <option value="">Choisir...</option>
                        {annees.map(a => <option key={a.id} value={a.id}>{a.libelle}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">SESSION</label>
                      <select className="form-select" value={formData.sessionId} onChange={(e) => setFormData({...formData, sessionId: e.target.value})}>
                        <option value="">Choisir...</option>
                        {sessions.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
                      </select>
                    </div>
                    
                    <div className="col-12">
                      <label className="form-label small fw-bold text-primary">PIÈCES REQUISES</label>
                      <div className="p-3 border rounded bg-light row mx-0" style={{maxHeight: '150px', overflowY: 'auto'}}>
                        {availablePieces.map(piece => (
                          <div key={piece.id} className="col-md-6 form-check">
                            <input 
                                className="form-check-input" 
                                type="checkbox" 
                                checked={formData.pieceDossierIds.includes(piece.id)}
                                onChange={() => handlePieceChange(piece.id)}
                                id={`p-${piece.id}`}
                            />
                            <label className="form-check-label small" htmlFor={`p-${piece.id}`}>{piece.nom}</label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-bold">MONTANT (FCFA)</label>
                      <input type="number" className="form-control" required value={formData.montant} onChange={(e) => setFormData({...formData, montant: e.target.value})} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Annuler</button>
                  <button type="submit" className="btn btn-primary px-4" disabled={submitting}>
                    {submitting ? <BiLoaderAlt className="spinner-border spinner-border-sm me-2"/> : "Enregistrer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICATIONS ET CONFIRMATION */}
      {notification.show && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1100 }}>
          <div className="modal-dialog modal-sm modal-dialog-centered">
            <div className="modal-content text-center p-4 shadow-lg border-0">
              {notification.type === 'error' ? <BiErrorCircle className="text-danger mb-2" size={40}/> : <BiCheck className="text-success mb-2" size={40}/>}
              <h6 className="fw-bold">{notification.title}</h6>
              <p className="small text-muted">{notification.message}</p>
              <button className="btn btn-sm btn-dark w-100 rounded-pill" onClick={() => setNotification({ ...notification, show: false })}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete.show && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1100 }}>
          <div className="modal-dialog modal-sm modal-dialog-centered">
            <div className="modal-content p-4 text-center shadow-lg border-0">
              <BiTrash className="text-danger mb-2" size={40}/>
              <h6 className="fw-bold">Supprimer ce concours ?</h6>
              <p className="small text-muted">Cette action est irréversible.</p>
              <div className="d-flex gap-2 mt-3">
                <button className="btn btn-sm btn-light border flex-grow-1 rounded-pill" onClick={() => setConfirmDelete({ show: false, id: null })}>Non</button>
                <button className="btn btn-sm btn-danger flex-grow-1 rounded-pill" onClick={executeDelete}>Oui, Supprimer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConcoursComponent;