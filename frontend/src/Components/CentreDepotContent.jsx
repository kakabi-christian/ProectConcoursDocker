import React, { useState, useEffect, useCallback } from 'react';
import { 
  BiSearch, BiChevronLeft, BiPlus, BiEditAlt, 
  BiTrash, BiLoaderAlt, BiCheck, BiErrorCircle,
  BiMapPin, BiBuildings
} from 'react-icons/bi';
import centreDepotService from '../services/centreDepotService';

const CentreDepotContent = () => {
  // --- ÉTATS ---
  const [centres, setCentres] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Récupération du rôle
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.userType === 'ADMIN'|| user.userType === 'SUPERADMIN';

  // États Modals
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({ 
    intitule: '', 
    lieuDepot: '' 
  });
  const [submitting, setSubmitting] = useState(false);

  // Notifications et Suppression
  const [notification, setNotification] = useState({ show: false, title: '', message: '', type: 'error' });
  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null });

  // Pagination et filtres
  const [pagination, setPagination] = useState({ total: 0, page: 1, lastPage: 1, hasNextPage: false, hasPreviousPage: false });
  const [filters, setFilters] = useState({ search: '', page: 1, limit: 10 });

  // --- CHARGEMENT DES DONNÉES ---
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await centreDepotService.getAll(filters);
      setCentres(response.data || []);
      setPagination(response.pagination);
    } catch (err) {
      showNotify("Erreur", "Impossible de charger les centres de dépôt.", "error");
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

  const openModal = (centre = null) => {
    if (!isAdmin) return;
    if (centre) {
      setIsEditing(true);
      setCurrentId(centre.id);
      setFormData({ 
        intitule: centre.intitule, 
        lieuDepot: centre.lieuDepot 
      });
    } else {
      setIsEditing(false);
      setFormData({ intitule: '', lieuDepot: '' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEditing) {
        await centreDepotService.update(currentId, formData);
      } else {
        await centreDepotService.create(formData);
      }
      setShowModal(false);
      loadData();
      showNotify("Succès", "Le centre a été enregistré avec succès.", "success");
    } catch (err) {
      showNotify("Erreur", "Échec de l'enregistrement.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const executeDelete = async () => {
    try {
      await centreDepotService.delete(confirmDelete.id);
      setConfirmDelete({ show: false, id: null });
      loadData();
      showNotify("Supprimé", "Le centre a été supprimé.", "success");
    } catch (err) {
      setConfirmDelete({ show: false, id: null });
      showNotify("Erreur", "La suppression a échoué.", "error");
    }
  };

  return (
    <div className="container-fluid p-4 bg-light min-vh-100">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Centres de Dépôt</h2>
          <p className="text-muted small">{pagination.total} centres configurés</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary d-flex align-items-center shadow-sm px-4" onClick={() => openModal()}>
            <BiPlus className="me-2" /> Nouveau Centre
          </button>
        )}
      </div>

      {/* BARRE DE RECHERCHE */}
      <div className="card shadow-sm border-0 mb-4 p-3">
        <div className="input-group w-50">
          <span className="input-group-text bg-white border-end-0"><BiSearch /></span>
          <input 
            type="text" className="form-control border-start-0 shadow-none" 
            placeholder="Rechercher par nom ou lieu..." 
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
                <th className="px-4 py-3">INTITULÉ DU CENTRE</th>
                <th className="py-3">LIEU DE DÉPÔT</th>
                <th className="py-3 text-center">ENRÔLEMENTS</th>
                {isAdmin && <th className="text-end px-4">ACTIONS</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="text-center py-5"><BiLoaderAlt className="spinner-border text-primary" /></td></tr>
              ) : centres.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-5 text-muted">Aucun centre trouvé</td></tr>
              ) : (
                centres.map((c) => (
                  <tr key={c.id}>
                    <td className="px-4">
                      <div className="d-flex align-items-center">
                        <div className="bg-light p-2 rounded me-3"><BiBuildings className="text-primary"/></div>
                        <span className="fw-bold text-dark">{c.intitule}</span>
                      </div>
                    </td>
                    <td>
                      <span className="text-muted d-flex align-items-center">
                        <BiMapPin className="me-1 text-danger"/> {c.lieuDepot}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className="badge bg-secondary rounded-pill">
                        {c._count?.enrollements || 0}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="text-end px-4">
                        <button className="btn btn-sm btn-light border me-2" onClick={() => openModal(c)}>
                          <BiEditAlt className="text-warning" />
                        </button>
                        <button className="btn btn-sm btn-light border" onClick={() => setConfirmDelete({ show: true, id: c.id })}>
                          <BiTrash className="text-danger" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* PAGINATION */}
        <div className="card-footer bg-white d-flex justify-content-between align-items-center">
          <small className="text-muted">Page {pagination.page} / {pagination.lastPage}</small>
          <div className="btn-group">
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
                  <h5 className="modal-title">{isEditing ? 'Modifier' : 'Nouveau'} Centre</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-bold small">NOM DU CENTRE</label>
                    <input type="text" className="form-control" required value={formData.intitule} onChange={(e) => setFormData({ ...formData, intitule: e.target.value })} placeholder="ex: Lycée Technique de Douala" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold small">LIEU DE DÉPÔT (ADRESSE/VILLE)</label>
                    <input type="text" className="form-control" required value={formData.lieuDepot} onChange={(e) => setFormData({ ...formData, lieuDepot: e.target.value })} placeholder="ex: Akwa, Rue 123" />
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Annuler</button>
                  <button type="submit" className="btn btn-primary px-4" disabled={submitting}>
                    {submitting ? <BiLoaderAlt className="spinner-border spinner-border-sm me-2"/> : <BiCheck className="me-1"/>} Enregistrer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICATIONS & CONFIRMATION (Modals identiques à Filière) */}
      {/* ... (Code des notifications et confirmation identique pour garder la cohérence) ... */}
    </div>
  );
};

export default CentreDepotContent;