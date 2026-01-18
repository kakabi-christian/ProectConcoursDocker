import React, { useState, useEffect, useCallback } from 'react';
import { 
  BiSearch, BiChevronLeft, BiPlus, BiEditAlt, 
  BiTrash, BiLoaderAlt, BiCheck, BiErrorCircle,
  BiExtension, BiLayer
} from 'react-icons/bi';
import specialiteService from '../services/specialiteService';
import filiereService from '../services/filiereService';

const SpecialiteComponent = () => {
  // --- ÉTATS ---
  const [specialites, setSpecialites] = useState([]);
  const [filieres, setFilieres] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.userType === 'ADMIN'|| user.userType === 'SUPERADMIN';

  // États Modals
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({ 
    libelle: '', 
    code: '', 
    filiereId: '', 
    isActive: true 
  });
  const [submitting, setSubmitting] = useState(false);

  // Notifications et Suppression
  const [notification, setNotification] = useState({ show: false, title: '', message: '', type: 'error' });
  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null });

  // Pagination et filtres
  const [pagination, setPagination] = useState({ total: 0, page: 1, lastPage: 1, hasNextPage: false, hasPreviousPage: false });
  const [filters, setFilters] = useState({ search: '', page: 1, limit: 10 });

  // --- CHARGEMENT DES DONNÉES ---
  const loadInitialData = async () => {
    try {
      const resFilieres = await filiereService.getAll({ limit: 100 });
      setFilieres(resFilieres.data || []);
    } catch (err) {
      console.error("Erreur chargement filières", err);
    }
  };

  const loadSpecialites = useCallback(async () => {
    setLoading(true);
    try {
      const response = await specialiteService.getAll(filters);
      setSpecialites(response.data || []);
      setPagination(response.pagination);
    } catch (err) {
      showNotify("Erreur", "Impossible de charger les spécialités.", "error");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => loadSpecialites(), 400);
    return () => clearTimeout(timer);
  }, [loadSpecialites]);

  // --- ACTIONS ---
  const showNotify = (title, message, type = 'error') => {
    setNotification({ show: true, title, message, type });
  };

  const openModal = (spec = null) => {
    if (!isAdmin) return;
    if (spec) {
      setIsEditing(true);
      setCurrentId(spec.id);
      setFormData({ 
        libelle: spec.libelle, 
        code: spec.code, 
        filiereId: spec.filiereId || '', 
        isActive: spec.isActive 
      });
    } else {
      setIsEditing(false);
      setFormData({ libelle: '', code: '', filiereId: '', isActive: true });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEditing) {
        await specialiteService.update(currentId, formData);
      } else {
        await specialiteService.create(formData);
      }
      setShowModal(false);
      loadSpecialites();
      showNotify("Succès", "Spécialité enregistrée avec succès.", "success");
    } catch (err) {
      showNotify("Erreur", "Vérifiez que le code est unique.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (spec) => {
    try {
      await specialiteService.update(spec.id, { isActive: !spec.isActive });
      loadSpecialites();
    } catch (err) {
      showNotify("Erreur", "Impossible de changer le statut.", "error");
    }
  };

  const executeDelete = async () => {
    try {
      await specialiteService.delete(confirmDelete.id);
      setConfirmDelete({ show: false, id: null });
      loadSpecialites();
      showNotify("Supprimé", "La spécialité a été supprimée.", "success");
    } catch (err) {
      setConfirmDelete({ show: false, id: null });
      showNotify("Erreur", "Suppression impossible.", "error");
    }
  };

  return (
    <div className="container-fluid p-4 bg-light min-vh-100">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Spécialités</h2>
          <p className="text-muted small">Catalogue des expertises ({pagination.total})</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary d-flex align-items-center shadow-sm px-4" onClick={() => openModal()}>
            <BiPlus className="me-2" /> Nouvelle Spécialité
          </button>
        )}
      </div>

      {/* RECHERCHE */}
      <div className="card shadow-sm border-0 mb-4 p-3">
        <div className="input-group w-50">
          <span className="input-group-text bg-white border-end-0"><BiSearch /></span>
          <input 
            type="text" className="form-control border-start-0 shadow-none" 
            placeholder="Rechercher par libellé ou code..." 
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
                <th className="px-4 py-3">CODE</th>
                <th className="py-3">LIBELLÉ</th>
                <th className="py-3">FILIÈRE</th>
                <th className="py-3 text-center">STATUT</th>
                {isAdmin && <th className="text-end px-4">ACTIONS</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center py-5"><BiLoaderAlt className="spinner-border text-primary" /></td></tr>
              ) : specialites.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-5 text-muted">Aucune spécialité trouvée</td></tr>
              ) : (
                specialites.map((s) => (
                  <tr key={s.id}>
                    <td className="px-4">
                      <span className="badge bg-white text-dark border px-2 py-1 font-monospace">{s.code}</span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="bg-light p-2 rounded me-3 text-primary"><BiExtension size={18}/></div>
                        <span className="fw-bold text-dark">{s.libelle}</span>
                      </div>
                    </td>
                    <td>
                      {/* BACKGROUND SUPPRIMÉ ICI */}
                      <div className="text-dark d-flex align-items-center small">
                        <BiLayer className="me-2 text-muted"/>
                        {s.filiere?.intitule || 'N/A'}
                      </div>
                    </td>
                    <td className="text-center">
                      <div className={`form-check form-switch d-flex justify-content-center ${!isAdmin && 'pe-none'}`}>
                        <input 
                          className="form-check-input" type="checkbox" checked={s.isActive} 
                          onChange={() => toggleStatus(s)} 
                        />
                      </div>
                    </td>
                    {isAdmin && (
                      <td className="text-end px-4">
                        <button className="btn btn-sm btn-light border me-2" onClick={() => openModal(s)}>
                          <BiEditAlt className="text-warning" />
                        </button>
                        <button className="btn btn-sm btn-light border" onClick={() => setConfirmDelete({ show: true, id: s.id })}>
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
                  <h5 className="modal-title">{isEditing ? 'Modifier' : 'Nouvelle'} Spécialité</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label fw-bold small">CODE</label>
                      <input type="text" className="form-control bg-light border-0 shadow-none" required value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} placeholder="ex: GL" />
                    </div>
                    <div className="col-md-8">
                      <label className="form-label fw-bold small">LIBELLÉ</label>
                      <input type="text" className="form-control bg-light border-0 shadow-none" required value={formData.libelle} onChange={(e) => setFormData({ ...formData, libelle: e.target.value })} placeholder="ex: Génie Logiciel" />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-bold small">FILIÈRE PARENTE</label>
                      <select className="form-select bg-light border-0 shadow-none" required value={formData.filiereId} onChange={(e) => setFormData({ ...formData, filiereId: e.target.value })}>
                        <option value="">Sélectionner une filière...</option>
                        {filieres.map(f => <option key={f.id} value={f.id}>{f.intitule}</option>)}
                      </select>
                    </div>
                    <div className="col-12 mt-4">
                        <div className="form-check form-switch">
                            <input className="form-check-input" type="checkbox" id="activeSwitch" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} />
                            <label className="form-check-label fw-bold" htmlFor="activeSwitch">Activer la spécialité</label>
                        </div>
                    </div>
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

      {/* 🔹 MODAL NOTIFICATION */}
      {notification.show && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1060 }}>
          <div className="modal-dialog modal-sm modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg text-center p-4">
                {notification.type === 'error' ? <BiErrorCircle className="text-danger mb-3" size={50} /> : <BiCheck className="text-success mb-3" size={50} />}
                <h5 className="fw-bold">{notification.title}</h5>
                <p className="text-muted small">{notification.message}</p>
                <button className="btn btn-dark w-100 mt-3" onClick={() => setNotification({ ...notification, show: false })}>Ok</button>
            </div>
          </div>
        </div>
      )}

      {/* 🔹 MODAL CONFIRMATION SUPPRESSION */}
      {confirmDelete.show && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1060 }}>
          <div className="modal-dialog modal-sm modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg p-4 text-center">
                <BiTrash className="text-danger mb-3" size={50} />
                <h5 className="fw-bold">Confirmer ?</h5>
                <p className="text-muted small">Voulez-vous supprimer cette spécialité ?</p>
                <div className="d-flex gap-2 mt-4">
                  <button className="btn btn-light border flex-grow-1" onClick={() => setConfirmDelete({ show: false, id: null })}>Non</button>
                  <button className="btn btn-danger flex-grow-1" onClick={executeDelete}>Oui, Supprimer</button>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpecialiteComponent;