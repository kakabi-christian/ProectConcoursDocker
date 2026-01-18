import React, { useState, useEffect, useCallback } from 'react';
import { 
  BiPlus, BiEditAlt, BiTrash, BiSearch, 
  BiChevronLeft, BiCheck, BiLoaderAlt, 
  BiErrorCircle, BiLayer, BiSortAZ, BiHash
} from 'react-icons/bi';
import niveauService from '../services/niveauService';

const NiveauContent = () => {
  // --- ÉTATS ---
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.userType === 'ADMIN' || user.userType === 'SUPERADMIN';

  // Pagination & Filtres
  const [pagination, setPagination] = useState({ total: 0, page: 1, lastPage: 1 });
  const [filters, setFilters] = useState({ search: '', page: 1, limit: 10 });

  // Formulaire
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    intitule: '',
    code: '',
    ordre: 1
  });
  const [submitting, setSubmitting] = useState(false);

  // Modals UI
  const [notification, setNotification] = useState({ show: false, title: '', message: '', type: 'error' });
  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null });

  // --- CHARGEMENT ---
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await niveauService.getAll(filters);
      setItems(response.data || []);
      setPagination(response.pagination);
    } catch (err) {
      showNotify("Erreur", "Impossible de charger les niveaux.", "error");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => loadData(), 400);
    return () => clearTimeout(timer);
  }, [loadData]);

  // --- ACTIONS ---
  const showNotify = (title, message, type = 'error') => {
    setNotification({ show: true, title, message, type });
  };

  const openModal = (niveau = null) => {
    if (!isAdmin) return;
    if (niveau) {
      setIsEditing(true);
      setCurrentId(niveau.id);
      setFormData({
        intitule: niveau.intitule,
        code: niveau.code || '',
        ordre: niveau.ordre || 1
      });
    } else {
      setIsEditing(false);
      setFormData({ intitule: '', code: '', ordre: items.length + 1 });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const dataToSave = { ...formData, ordre: parseInt(formData.ordre) };
      if (isEditing) {
        await niveauService.update(currentId, dataToSave);
      } else {
        await niveauService.create(dataToSave);
      }
      setShowModal(false);
      loadData();
      showNotify("Succès", "Niveau académique enregistré.", "success");
    } catch (err) {
      showNotify("Erreur", "Une erreur est survenue.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await niveauService.delete(confirmDelete.id);
      setConfirmDelete({ show: false, id: null });
      loadData();
      showNotify("Supprimé", "Le niveau a été supprimé.", "success");
    } catch (err) {
      showNotify("Erreur", "Ce niveau est lié à des épreuves existantes.", "error");
      setConfirmDelete({ show: false, id: null });
    }
  };

  return (
    <div className="container-fluid p-4 bg-light min-vh-100">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Niveaux Académiques</h2>
          <p className="text-muted small">Définissez la hiérarchie des diplômes et cycles</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary d-flex align-items-center shadow-sm px-4" onClick={() => openModal()}>
            <BiPlus className="me-2" /> Nouveau Niveau
          </button>
        )}
      </div>

      {/* RECHERCHE */}
      <div className="card shadow-sm border-0 mb-4 p-3">
        <div className="input-group w-50">
          <span className="input-group-text bg-white border-end-0 text-muted"><BiSearch /></span>
          <input 
            type="text" className="form-control border-start-0 shadow-none" 
            placeholder="Rechercher un niveau ou un code..." 
            value={filters.search}
            onChange={(e) => setFilters(f => ({ ...f, search: e.target.value, page: 1 }))}
          />
        </div>
      </div>

      {/* TABLEAU */}
      <div className="card shadow-sm border-0 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-primary text-white">
              <tr>
                <th className="px-4 py-3" style={{ width: '80px' }}>ORDRE</th>
                <th className="py-3">CODE</th>
                <th className="py-3">INTITULÉ COMPLET</th>
                {isAdmin && <th className="text-end px-4">ACTIONS</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="text-center py-5"><BiLoaderAlt className="spinner-border text-primary" /></td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-5 text-muted">Aucun niveau défini</td></tr>
              ) : (
                items.map(item => (
                  <tr key={item.id}>
                    <td className="px-4 text-center">
                      <span className="badge rounded-pill bg-light text-primary border">{item.ordre}</span>
                    </td>
                    <td><code className="fw-bold text-secondary">{item.code || '-'}</code></td>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="bg-info-subtle p-2 rounded me-3 text-info"><BiLayer size={20}/></div>
                        <span className="fw-bold text-dark">{item.intitule}</span>
                      </div>
                    </td>
                    {isAdmin && (
                      <td className="text-end px-4">
                        <button className="btn btn-sm btn-light border me-2" onClick={() => openModal(item)}><BiEditAlt className="text-warning"/></button>
                        <button className="btn btn-sm btn-light border" onClick={() => setConfirmDelete({ show: true, id: item.id })}><BiTrash className="text-danger"/></button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="card-footer bg-white d-flex justify-content-between align-items-center py-3">
          <small className="text-muted">Total : {pagination.total} niveau(x)</small>
          <div className="btn-group">
            <button className="btn btn-sm btn-outline-secondary" disabled={pagination.page <= 1} onClick={() => setFilters(f => ({...f, page: f.page - 1}))}><BiChevronLeft/></button>
            <button className="btn btn-sm btn-primary px-3" disabled={pagination.page >= pagination.lastPage} onClick={() => setFilters(f => ({...f, page: f.page + 1}))}>Suivant</button>
          </div>
        </div>
      </div>

      {/* MODAL FORMULAIRE */}
      {showModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <form onSubmit={handleSubmit}>
                <div className="modal-header bg-dark text-white border-0">
                  <h5 className="modal-title fw-bold">{isEditing ? 'Modifier' : 'Ajouter'} un Niveau</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-bold small"><BiLayer className="me-1"/> Intitulé du niveau</label>
                    <input type="text" className="form-control shadow-none" placeholder="ex: Licence Professionnelle" required value={formData.intitule} onChange={e => setFormData({...formData, intitule: e.target.value})} />
                  </div>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-bold small"><BiHash className="me-1"/> Code</label>
                      <input type="text" className="form-control shadow-none" placeholder="ex: LP" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold small"><BiSortAZ className="me-1"/> Ordre d'affichage</label>
                      <input type="number" className="form-control shadow-none" required value={formData.ordre} onChange={e => setFormData({...formData, ordre: e.target.value})} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-light px-4" onClick={() => setShowModal(false)}>Annuler</button>
                  <button type="submit" className="btn btn-primary px-4 shadow-sm" disabled={submitting}>
                    {submitting ? <BiLoaderAlt className="spinner-border spinner-border-sm me-2"/> : <BiCheck className="me-1"/>} Enregistrer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICATIONS & CONFIRMATION */}
      {notification.show && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.2)', zIndex: 1060 }}>
          <div className="modal-dialog modal-sm modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg text-center p-4">
              {notification.type === 'error' ? <BiErrorCircle className="text-danger mb-2" size={40}/> : <BiCheck className="text-success mb-2" size={40}/>}
              <h6 className="fw-bold">{notification.title}</h6>
              <p className="small text-muted mb-3">{notification.message}</p>
              <button className="btn btn-dark btn-sm w-100" onClick={() => setNotification({...notification, show: false})}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete.show && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1060 }}>
          <div className="modal-dialog modal-sm modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg p-4 text-center">
              <BiTrash className="text-danger mb-2" size={40}/>
              <h6 className="fw-bold">Supprimer le niveau ?</h6>
              <p className="small text-muted mb-4">Assurez-vous qu'aucune épreuve n'est rattachée à ce niveau.</p>
              <div className="d-flex gap-2">
                <button className="btn btn-light btn-sm flex-grow-1 border" onClick={() => setConfirmDelete({show: false, id: null})}>Annuler</button>
                <button className="btn btn-danger btn-sm flex-grow-1 shadow-sm" onClick={handleDelete}>Supprimer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NiveauContent;