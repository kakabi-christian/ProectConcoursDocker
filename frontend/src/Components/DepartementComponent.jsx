import React, { useState, useEffect, useCallback } from 'react';
import { 
  BiSearch, BiChevronLeft, BiPlus, BiEditAlt, 
  BiTrash, BiLoaderAlt, BiCheck, BiErrorCircle,
  BiBuildings, BiTimeFive
} from 'react-icons/bi';
import departementService from '../services/departementService';

const DepartementComponent = () => {
  // --- ÉTATS ---
  const [departements, setDepartements] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.userType === 'ADMIN'||user.userType === 'SUPERADMIN';

  // États Formulaire
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({ nomDep: '' });
  const [submitting, setSubmitting] = useState(false);

  // Notifications et Suppression
  const [notification, setNotification] = useState({ show: false, title: '', message: '', type: 'error' });
  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null });

  // Pagination et filtres
  const [pagination, setPagination] = useState({ total: 0, page: 1, lastPage: 1, hasNextPage: false, hasPreviousPage: false });
  const [filters, setFilters] = useState({ search: '', page: 1, limit: 10 });

  // --- LOGIQUE DE CHARGEMENT ---
  const loadDepartements = useCallback(async () => {
    setLoading(true);
    try {
      const result = await departementService.getAll(filters);
      setDepartements(result.data || []);
      setPagination(result.pagination);
    } catch (err) {
      if (err.response?.status === 403) {
        showNotify("Accès Restreint", "Vous n'avez pas la permission de voir ces données.", "error");
      }
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => loadDepartements(), 400);
    return () => clearTimeout(timer);
  }, [loadDepartements]);

  // --- ACTIONS ---
  const showNotify = (title, message, type = 'error') => {
    setNotification({ show: true, title, message, type });
  };

  const openModal = (dep = null) => {
    if (!isAdmin) {
        showNotify("Permission refusée", "Vous n'avez pas les droits.", "error");
        return;
    }
    if (dep) {
      setIsEditing(true);
      setCurrentId(dep.id);
      setFormData({ nomDep: dep.nomDep });
    } else {
      setIsEditing(false);
      setFormData({ nomDep: '' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEditing) {
        await departementService.update(currentId, formData);
      } else {
        await departementService.create(formData);
      }
      setShowModal(false);
      loadDepartements();
      showNotify("Succès", "Département enregistré avec succès.", "success");
    } catch (err) {
      const msg = err.response?.status === 403 
        ? "Action interdite : Permission insuffisante." 
        : "Erreur lors de l'enregistrement.";
      showNotify("Erreur", msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const executeDelete = async () => {
    try {
      await departementService.delete(confirmDelete.id);
      setConfirmDelete({ show: false, id: null });
      loadDepartements();
      showNotify("Supprimé", "Le département a été retiré.", "success");
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
          <h2 className="fw-bold text-dark mb-1">Structure Académique</h2>
          <p className="text-muted small">Gestion des départements ({pagination.total})</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary d-flex align-items-center shadow-sm px-4" onClick={() => openModal()}>
            <BiPlus className="me-2" /> Nouveau Département
          </button>
        )}
      </div>

      {/* RECHERCHE */}
      <div className="card shadow-sm border-0 mb-4 p-3">
        <div className="input-group w-50">
          <span className="input-group-text bg-white border-end-0"><BiSearch /></span>
          <input 
            type="text" className="form-control border-start-0 shadow-none" 
            placeholder="Rechercher un département..." 
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
                <th className="px-4 py-3">NOM DU DÉPARTEMENT</th>
                <th className="py-3">DATE DE CRÉATION</th>
                {isAdmin && <th className="text-end px-4">ACTIONS</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={isAdmin ? "3" : "2"} className="text-center py-5"><BiLoaderAlt className="spinner-border text-primary" /></td></tr>
              ) : departements.length === 0 ? (
                <tr><td colSpan={isAdmin ? "3" : "2"} className="text-center py-5 text-muted">Aucun département trouvé</td></tr>
              ) : (
                departements.map((dep) => (
                  <tr key={dep.id}>
                    <td className="px-4">
                      <div className="d-flex align-items-center">
                        <div className="bg-white p-2 rounded me-3 text-primary">
                          <BiBuildings size={20} />
                        </div>
                        <span className="fw-bold text-dark">{dep.nomDep}</span>
                      </div>
                    </td>
                    <td>
                      <div className="text-muted small">
                        <BiTimeFive className="me-1" />
                        {new Date(dep.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    </td>
                    {isAdmin && (
                      <td className="text-end px-4">
                        <button className="btn btn-sm btn-black border me-2" onClick={() => openModal(dep)}>
                          <BiEditAlt className="text-warning" />
                        </button>
                        <button className="btn btn-sm btn-light border" onClick={() => setConfirmDelete({ show: true, id: dep.id })}>
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
                  <h5 className="modal-title">{isEditing ? 'Modifier' : 'Nouveau'} Département</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body p-4">
                  <label className="form-label fw-bold small">NOM DU DÉPARTEMENT</label>
                  <input type="text" className="form-control form-control-lg bg-light border-0 shadow-none" required value={formData.nomDep} onChange={(e) => setFormData({ nomDep: e.target.value })} placeholder="Ex: Informatique" />
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

      {/* MODAL NOTIFICATION */}
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

      {/* MODAL CONFIRMATION SUPPRESSION */}
      {confirmDelete.show && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1060 }}>
          <div className="modal-dialog modal-sm modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg p-4 text-center">
                <BiTrash className="text-danger mb-3" size={50} />
                <h5 className="fw-bold">Confirmer ?</h5>
                <p className="text-muted small">Voulez-vous supprimer ce département ?</p>
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

export default DepartementComponent;