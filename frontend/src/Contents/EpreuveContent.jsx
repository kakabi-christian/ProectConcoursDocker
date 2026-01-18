import React, { useState, useEffect, useCallback } from 'react';
import { 
  BiPlus, BiEditAlt, BiTrash, BiSearch, 
  BiChevronLeft, BiCheck, BiLoaderAlt, 
  BiErrorCircle, BiBookBookmark, BiFilterAlt, BiDownload
} from 'react-icons/bi';
import epreuveService from '../services/epreuveService';
import filiereService from '../services/filiereService';
import niveauService from '../services/niveauService';

const EpreuveContent = () => {
  // --- ÉTATS ---
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filieres, setFilieres] = useState([]);
  const [niveaux, setNiveaux] = useState([]);
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.userType === 'ADMIN' || user.userType === 'SUPERADMIN';

  const [pagination, setPagination] = useState({ total: 0, page: 1, lastPage: 1 });
  const [filters, setFilters] = useState({ search: '', filiereId: '', page: 1, limit: 12 }); // Limite à 12 pour une grille équilibrée

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    nomEpreuve: '',
    nonEliminatoire: false,
    filiereId: '',
    niveauId: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState({ show: false, title: '', message: '', type: 'error' });
  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null });

  // --- LOGIQUE DE DONNÉES ---
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await epreuveService.getAll(filters);
      setItems(response.data || []);
      setPagination(response.pagination);
    } catch (err) {
      showNotify("Erreur", "Impossible de charger les épreuves.", "error");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadDependencies = async () => {
    try {
      const [fRes, nRes] = await Promise.all([
        filiereService.getAll({ limit: 100 }),
        niveauService.getAll({ limit: 100 })
      ]);
      setFilieres(fRes.data || []);
      setNiveaux(nRes.data || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { loadDependencies(); }, []);
  useEffect(() => {
    const timer = setTimeout(() => loadData(), 400);
    return () => clearTimeout(timer);
  }, [loadData]);

  // --- HANDLERS ---
  const showNotify = (title, message, type = 'error') => {
    setNotification({ show: true, title, message, type });
    setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 4000);
  };

  const openModal = (epreuve = null) => {
    if (!isAdmin) return;
    if (epreuve) {
      setIsEditing(true);
      setCurrentId(epreuve.id);
      setFormData({
        nomEpreuve: epreuve.nomEpreuve,
        nonEliminatoire: epreuve.nonEliminatoire || false,
        filiereId: epreuve.filiereId || '',
        niveauId: epreuve.niveauId || ''
      });
    } else {
      setIsEditing(false);
      setFormData({ nomEpreuve: '', nonEliminatoire: false, filiereId: '', niveauId: '' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEditing) await epreuveService.update(currentId, formData);
      else await epreuveService.create(formData);
      setShowModal(false);
      loadData();
      showNotify("Succès", "L'opération a été effectuée avec succès.", "success");
    } catch (err) {
      showNotify("Erreur", "Veuillez vérifier les champs du formulaire.", "error");
    } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    try {
      await epreuveService.delete(confirmDelete.id);
      setConfirmDelete({ show: false, id: null });
      loadData();
      showNotify("Supprimé", "L'épreuve a été retirée définitivement.", "success");
    } catch (err) {
      showNotify("Erreur", "Action impossible pour le moment.", "error");
      setConfirmDelete({ show: false, id: null });
    }
  };

  return (
    <div className="min-vh-100 bg-light pb-5">
      {/* HEADER */}
      <div className="bg-white border-bottom py-4 mb-4 shadow-sm">
        <div className="container-fluid px-4">
          <div className="row align-items-center">
            <div className="col">
              <h2 className="fw-bold text-dark mb-0">Banque d'Épreuves</h2>
              <p className="text-muted small mb-0">Gestion centralisée du catalogue des matières</p>
            </div>
            {isAdmin && (
              <div className="col-auto">
                <button 
                  className="btn btn-primary px-4 py-2 d-flex align-items-center gap-2 shadow"
                  onClick={() => openModal()}
                >
                  <BiPlus size={20} /> <span className="d-none d-md-inline">Nouvelle Épreuve</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container-fluid px-4">
        {/* BARRE DE FILTRES */}
        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body p-3">
            <div className="row g-3">
              <div className="col-lg-8">
                <div className="input-group input-group-lg border rounded-3 overflow-hidden bg-light">
                  <span className="input-group-text bg-transparent border-0 text-muted"><BiSearch /></span>
                  <input 
                    type="text" className="form-control bg-transparent border-0 shadow-none ps-0" 
                    placeholder="Rechercher par nom d'épreuve..." 
                    value={filters.search}
                    onChange={(e) => setFilters(f => ({ ...f, search: e.target.value, page: 1 }))}
                  />
                </div>
              </div>
              <div className="col-lg-4">
                <div className="input-group input-group-lg border rounded-3 overflow-hidden bg-light">
                  <span className="input-group-text bg-transparent border-0 text-muted"><BiFilterAlt /></span>
                  <select 
                    className="form-select bg-transparent border-0 shadow-none"
                    value={filters.filiereId}
                    onChange={(e) => setFilters(f => ({ ...f, filiereId: e.target.value, page: 1 }))}
                  >
                    <option value="">Toutes les filières</option>
                    {filieres.map(f => <option key={f.id} value={f.id}>{f.intitule}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AFFICHAGE EN FLEXBOX (CARTES) */}
        {loading ? (
          <div className="text-center py-5">
            <BiLoaderAlt className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}} />
            <p className="mt-3 text-muted">Chargement de la banque d'épreuves...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-5 bg-white rounded-4 shadow-sm border">
            <BiBookBookmark size={60} className="text-light mb-3" />
            <h4 className="text-muted">Aucune épreuve trouvée</h4>
            <p className="text-muted small">Essayez de modifier vos filtres de recherche.</p>
          </div>
        ) : (
          <div className="d-flex flex-wrap gap-4 justify-content-start">
            {items.map(item => (
              <div 
                key={item.id} 
                className="card border-0 shadow-sm rounded-4 p-0 card-hover animate-fade-in flex-grow-1 flex-md-grow-0" 
                style={{ width: '100%', maxWidth: '350px', transition: 'transform 0.2s' }}
              >
                <div className="p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="rounded-3 bg-primary-subtle text-primary p-2 d-flex align-items-center justify-content-center" style={{width: '45px', height: '45px'}}>
                      <BiBookBookmark size={24}/>
                    </div>
                    {item.nonEliminatoire ? (
                      <span className="badge rounded-pill bg-success-subtle text-success border border-success px-3">Bonus</span>
                    ) : (
                      <span className="badge rounded-pill bg-danger-subtle text-danger border border-danger px-3">Éliminatoire</span>
                    )}
                  </div>

                  <div className="mb-4">
                    <h5 className="fw-bold text-dark mb-1 text-truncate" title={item.nomEpreuve}>
                      {item.nomEpreuve}
                    </h5>
                    <small className="text-muted fw-medium">CODE: {item.id.toString().slice(-6).toUpperCase()}</small>
                  </div>

                  <div className="bg-light rounded-3 p-3 mb-3">
                    <div className="d-flex flex-column gap-1">
                      <div className="small fw-bold text-primary text-uppercase">{item.filiere?.intitule || 'Filière Générale'}</div>
                      <div className="small text-muted">Niveau : {item.niveau?.intitule || 'Tous niveaux'}</div>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                    {isAdmin ? (
                      <div className="d-flex gap-2">
                        <button className="btn btn-sm btn-outline-warning border-0 rounded-circle p-2" onClick={() => openModal(item)}>
                          <BiEditAlt size={18}/>
                        </button>
                        <button className="btn btn-sm btn-outline-danger border-0 rounded-circle p-2" onClick={() => setConfirmDelete({ show: true, id: item.id })}>
                          <BiTrash size={18}/>
                        </button>
                      </div>
                    ) : <div></div>}
                    
                    <button className="btn btn-primary btn-sm px-4 rounded-pill d-flex align-items-center gap-2">
                      <BiDownload /> Télécharger
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PAGINATION */}
        <div className="mt-5 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <div className="text-muted small fw-medium">
            Affichage de {items.length} sur <strong>{pagination.total}</strong> épreuves
          </div>
          <nav className="d-flex align-items-center gap-2">
            <button 
              className="btn btn-white border shadow-sm px-3 d-flex align-items-center" 
              disabled={pagination.page <= 1} 
              onClick={() => setFilters(f => ({...f, page: f.page - 1}))}
            >
              <BiChevronLeft size={20}/>
            </button>
            <div className="px-3 py-1 bg-white border rounded-3 small fw-bold shadow-sm">
              Page {pagination.page} / {pagination.lastPage}
            </div>
            <button 
              className="btn btn-white border shadow-sm px-3 d-flex align-items-center" 
              disabled={pagination.page >= pagination.lastPage} 
              onClick={() => setFilters(f => ({...f, page: f.page + 1}))}
            >
              <span className="me-1">Suivant</span> <BiChevronLeft size={20} style={{transform: 'rotate(180deg)'}}/>
            </button>
          </nav>
        </div>
      </div>

      {/* MODAL : FORMULAIRE */}
      {showModal && (
        <div className="modal d-block animate-fade-in" style={{ backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <form onSubmit={handleSubmit}>
                <div className="modal-header bg-primary text-white border-0 py-3">
                  <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                    {isEditing ? <BiEditAlt /> : <BiPlus />}
                    {isEditing ? 'Modifier l\'épreuve' : 'Nouvelle Épreuve'}
                  </h5>
                  <button type="button" className="btn-close btn-close-white shadow-none" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body p-4">
                  <div className="mb-4">
                    <label className="form-label fw-bold text-secondary small text-uppercase">Nom de la matière</label>
                    <input 
                      type="text" className="form-control form-control-lg bg-light border-0" 
                      required placeholder="Ex: API REST & Web Services" 
                      value={formData.nomEpreuve} 
                      onChange={e => setFormData({...formData, nomEpreuve: e.target.value})} 
                    />
                  </div>
                  
                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label className="form-label fw-bold text-secondary small text-uppercase">Filière</label>
                      <select className="form-select border-0 bg-light" required value={formData.filiereId} onChange={e => setFormData({...formData, filiereId: e.target.value})}>
                        <option value="">Sélectionner...</option>
                        {filieres.map(f => <option key={f.id} value={f.id}>{f.intitule}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold text-secondary small text-uppercase">Niveau ciblé</label>
                      <select className="form-select border-0 bg-light" value={formData.niveauId} onChange={e => setFormData({...formData, niveauId: e.target.value})}>
                        <option value="">Tous les niveaux</option>
                        {niveaux.map(n => <option key={n.id} value={n.id}>{n.intitule}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="p-3 bg-light rounded-3 border-start border-4 border-primary">
                    <div className="form-check form-switch d-flex align-items-center justify-content-between p-0">
                      <label className="form-check-label fw-bold text-dark cursor-pointer" htmlFor="nonEliminatoire">
                         Note non-éliminatoire ?
                      </label>
                      <input 
                        className="form-check-input ms-0" 
                        type="checkbox" 
                        role="switch"
                        id="nonEliminatoire" 
                        checked={formData.nonEliminatoire}
                        onChange={e => setFormData({...formData, nonEliminatoire: e.target.checked})}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light border-0 py-3">
                  <button type="button" className="btn btn-link text-muted fw-bold text-decoration-none px-4" onClick={() => setShowModal(false)}>Annuler</button>
                  <button type="submit" className="btn btn-primary px-5 shadow" disabled={submitting}>
                    {submitting ? <BiLoaderAlt className="spinner-border spinner-border-sm me-2"/> : <BiCheck size={20} className="me-1"/>} 
                    {isEditing ? 'Mettre à jour' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICATION */}
      {notification.show && (
        <div className="position-fixed bottom-0 end-0 p-4" style={{ zIndex: 2000 }}>
          <div className={`alert ${notification.type === 'success' ? 'alert-success border-success' : 'alert-danger border-danger'} shadow-lg d-flex align-items-center mb-0 px-4 py-3 rounded-4 animate-slide-in`}>
            {notification.type === 'success' ? <BiCheck className="me-3" size={28}/> : <BiErrorCircle className="me-3" size={28}/>}
            <div>
              <h6 className="fw-bold mb-0">{notification.title}</h6>
              <p className="small mb-0">{notification.message}</p>
            </div>
            <button className="btn-close ms-4 shadow-none" onClick={() => setNotification({...notification, show: false})}></button>
          </div>
        </div>
      )}

      {/* CONFIRMATION SUPPRESSION */}
      {confirmDelete.show && (
        <div className="modal d-block animate-fade-in" style={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', zIndex: 1100 }}>
          <div className="modal-dialog modal-sm modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 p-4 text-center">
              <div className="bg-danger-subtle text-danger rounded-circle d-inline-flex p-3 mb-3 mx-auto">
                <BiTrash size={32}/>
              </div>
              <h5 className="fw-bold text-dark">Confirmer ?</h5>
              <p className="small text-muted mb-4">Souhaitez-vous vraiment supprimer cette épreuve de la base de données ?</p>
              <div className="d-grid gap-2">
                <button className="btn btn-danger py-2 fw-bold" onClick={handleDelete}>Oui, supprimer</button>
                <button className="btn btn-light py-2" onClick={() => setConfirmDelete({show: false, id: null})}>Annuler</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .animate-fade-in { animation: fadeIn 0.3s ease-out; }
        .animate-slide-in { animation: slideIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .card-hover:hover { transform: translateY(-5px); box-shadow: 0 1rem 3rem rgba(0,0,0,.1) !important; cursor: pointer; }
        .cursor-pointer { cursor: pointer; }
        .extra-small { font-size: 0.75rem; }
      `}</style>
    </div>
  );
};

export default EpreuveContent;