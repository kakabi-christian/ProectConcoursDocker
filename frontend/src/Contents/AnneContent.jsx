import React, { useState, useEffect, useCallback } from 'react';
import { 
  BiPlus, BiEditAlt, BiTrash, BiSearch, 
  BiChevronLeft, BiCheck, BiLoaderAlt, 
  BiCalendar, BiCalendarCheck, BiErrorCircle, 
  BiToggleLeft, BiToggleRight, BiTimeFive
} from 'react-icons/bi';
import anneeService from '../services/anneeService';

const AnneeContent = () => {
  // --- ÉTATS ---
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.userType === 'ADMIN'|| user.userType === 'SUPERADMIN';

  // Pagination & Filtres
  const [pagination, setPagination] = useState({ 
    total: 0, 
    page: 1, 
    lastPage: 1,
    hasNextPage: false,
    hasPreviousPage: false 
  });
  const [filters, setFilters] = useState({ search: '', page: 1, limit: 10 });

  // Formulaire
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    libelle: '',
    dateDebut: '',
    dateFin: '',
    estActive: true
  });
  const [submitting, setSubmitting] = useState(false);

  // Modals UI
  const [notification, setNotification] = useState({ show: false, title: '', message: '', type: 'error' });
  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null });

  // --- CHARGEMENT DES DONNÉES ---
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await anneeService.getAll(filters);
      setItems(response.data || []);
      setPagination(response.pagination);
    } catch (err) {
      showNotify("Erreur", "Impossible de charger les années académiques.", "error");
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

  const openModal = (annee = null) => {
    if (!isAdmin) return;
    if (annee) {
      setIsEditing(true);
      setCurrentId(annee.id);
      setFormData({
        libelle: annee.libelle || '',
        dateDebut: annee.dateDebut ? annee.dateDebut.split('T')[0] : '',
        dateFin: annee.dateFin ? annee.dateFin.split('T')[0] : '',
        estActive: annee.estActive
      });
    } else {
      setIsEditing(false);
      setFormData({ libelle: '', dateDebut: '', dateFin: '', estActive: true });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEditing) {
        await anneeService.update(currentId, formData);
      } else {
        await anneeService.create(formData);
      }
      setShowModal(false);
      loadData();
      showNotify("Succès", "Année académique enregistrée.", "success");
    } catch (err) {
      showNotify("Erreur", "Une erreur est survenue lors de l'enregistrement.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (annee) => {
    try {
      await anneeService.update(annee.id, { estActive: !annee.estActive });
      loadData();
    } catch (err) {
      showNotify("Erreur", "Impossible de changer le statut.", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await anneeService.delete(confirmDelete.id);
      setConfirmDelete({ show: false, id: null });
      loadData();
      showNotify("Supprimé", "L'année a été supprimée.", "success");
    } catch (err) {
      showNotify("Erreur", "Cette année est probablement liée à des concours.", "error");
      setConfirmDelete({ show: false, id: null });
    }
  };

  return (
    <div className="container-fluid p-4 bg-light min-vh-100">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Années Académiques</h2>
          <p className="text-muted small">Gestion des cycles et périodes de concours</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary d-flex align-items-center shadow-sm px-4" onClick={() => openModal()}>
            <BiPlus className="me-2" /> Nouvelle Année
          </button>
        )}
      </div>

      {/* BARRE DE RECHERCHE */}
      <div className="card shadow-sm border-0 mb-4 p-3">
        <div className="input-group w-50">
          <span className="input-group-text bg-white border-end-0 text-muted"><BiSearch /></span>
          <input 
            type="text" className="form-control border-start-0 shadow-none" 
            placeholder="Rechercher une année (ex: 2024)..." 
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
                <th className="px-4 py-3">LIBELLÉ</th>
                <th className="py-3">DÉBUT</th>
                <th className="py-3">FIN</th>
                <th className="py-3 text-center">STATUT</th>
                {isAdmin && <th className="text-end px-4">ACTIONS</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center py-5"><BiLoaderAlt className="spinner-border text-primary" /></td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-5 text-muted">Aucune donnée trouvée</td></tr>
              ) : (
                items.map(item => (
                  <tr key={item.id}>
                    <td className="px-4">
                      <div className="d-flex align-items-center">
                        <div className="bg-light p-2 rounded me-3 text-primary"><BiTimeFive size={20}/></div>
                        <span className="fw-bold text-dark">{item.libelle}</span>
                      </div>
                    </td>
                    <td>
                      <div className="small">
                        <BiCalendar className="me-1 text-primary"/> {item.dateDebut ? new Date(item.dateDebut).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td>
                      <div className="small">
                        <BiCalendarCheck className="me-1 text-danger"/> {item.dateFin ? new Date(item.dateFin).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td className="text-center">
                      <button 
                        className={`btn btn-sm shadow-none ${item.estActive ? 'text-success' : 'text-muted'}`}
                        onClick={() => isAdmin && toggleStatus(item)}
                        disabled={!isAdmin}
                      >
                        {item.estActive ? <BiToggleRight size={32} /> : <BiToggleLeft size={32} />}
                      </button>
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
          <small className="text-muted">Total : {pagination.total} année(s)</small>
          <div className="btn-group shadow-sm">
            <button className="btn btn-sm btn-outline-secondary" disabled={!pagination.hasPreviousPage} onClick={() => setFilters(f => ({...f, page: f.page - 1}))}><BiChevronLeft/></button>
            <button className="btn btn-sm btn-primary px-3" disabled={!pagination.hasNextPage} onClick={() => setFilters(f => ({...f, page: f.page + 1}))}>Suivant</button>
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
                  <h5 className="modal-title fw-bold">{isEditing ? 'Modifier' : 'Ajouter'} une Année</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-bold small text-uppercase">Libellé</label>
                    <input type="text" className="form-control shadow-none" placeholder="ex: 2024-2025" required value={formData.libelle} onChange={e => setFormData({...formData, libelle: e.target.value})} />
                  </div>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-bold small text-uppercase">Date Début</label>
                      <input type="date" className="form-control shadow-none" value={formData.dateDebut} onChange={e => setFormData({...formData, dateDebut: e.target.value})} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold small text-uppercase">Date Fin</label>
                      <input type="date" className="form-control shadow-none" value={formData.dateFin} onChange={e => setFormData({...formData, dateFin: e.target.value})} />
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
              <button className="btn btn-dark btn-sm w-100 shadow-sm" onClick={() => setNotification({...notification, show: false})}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete.show && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
          <div className="modal-dialog modal-sm modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg p-4 text-center">
              <BiTrash className="text-danger mb-2" size={40}/>
              <h6 className="fw-bold">Supprimer l'année ?</h6>
              <p className="small text-muted mb-4">Cette action est irréversible et peut affecter les données liées.</p>
              <div className="d-flex gap-2">
                <button className="btn btn-light btn-sm flex-grow-1 border" onClick={() => setConfirmDelete({show: false, id: null})}>Annuler</button>
                <button className="btn btn-danger btn-sm flex-grow-1 shadow-sm" onClick={handleDelete}>Confirmer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnneeContent;