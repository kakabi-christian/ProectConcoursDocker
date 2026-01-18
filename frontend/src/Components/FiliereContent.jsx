import React, { useState, useEffect, useCallback } from 'react';
import { 
  BiSearch, BiChevronLeft, BiPlus, BiEditAlt, 
  BiTrash, BiLoaderAlt, BiCheck, BiErrorCircle,
  BiBookBookmark, BiBuildings
} from 'react-icons/bi';
import filiereService from '../services/filiereService';
import departementService from '../services/departementService';

const FiliereContent = () => {
  // --- ÉTATS ---
  const [filieres, setFilieres] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.userType === 'ADMIN'|| user.userType === 'SUPERADMIN';

  // États Modals
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({ 
    intitule: '', 
    description: '', 
    departementId: '' 
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
      const [filiereRes, deptRes] = await Promise.all([
        filiereService.getAll(filters),
        departementService.getAll({ limit: 100 })
      ]);
      setFilieres(filiereRes.data || []);
      setPagination(filiereRes.pagination);
      setDepartements(deptRes.data || []);
    } catch (err) {
      showNotify("Erreur", "Impossible de charger les données.", "error");
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

  const openModal = (filiere = null) => {
    if (!isAdmin) return;
    if (filiere) {
      setIsEditing(true);
      setCurrentId(filiere.id);
      setFormData({ 
        intitule: filiere.intitule, 
        description: filiere.description || '', 
        departementId: filiere.departementId 
      });
    } else {
      setIsEditing(false);
      setFormData({ intitule: '', description: '', departementId: '' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEditing) {
        await filiereService.update(currentId, formData);
      } else {
        await filiereService.create(formData);
      }
      setShowModal(false);
      loadData();
      showNotify("Succès", "La filière a été enregistrée.", "success");
    } catch (err) {
      showNotify("Erreur", "Échec de l'enregistrement.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const executeDelete = async () => {
    try {
      await filiereService.delete(confirmDelete.id);
      setConfirmDelete({ show: false, id: null });
      loadData();
      showNotify("Supprimé", "La filière a été supprimée.", "success");
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
          <h2 className="fw-bold text-dark mb-1">Filières Académiques</h2>
          <p className="text-muted small">Gestion des spécialités et cursus ({pagination.total})</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary d-flex align-items-center shadow-sm px-4" onClick={() => openModal()}>
            <BiPlus className="me-2" /> Nouvelle Filière
          </button>
        )}
      </div>

      {/* BARRE DE RECHERCHE */}
      <div className="card shadow-sm border-0 mb-4 p-3">
        <div className="input-group w-50">
          <span className="input-group-text bg-white border-end-0"><BiSearch /></span>
          <input 
            type="text" className="form-control border-start-0 shadow-none" 
            placeholder="Rechercher une filière..." 
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
          />
        </div>
      </div>

      {/* TABLEAU DES FILIÈRES */}
      <div className="card shadow-sm border-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-primary text-white">
              <tr>
                <th className="px-4 py-3">INTITULÉ</th>
                <th className="py-3">DÉPARTEMENT</th>
                <th className="py-3">DESCRIPTION</th>
                {isAdmin && <th className="text-end px-4">ACTIONS</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="text-center py-5"><BiLoaderAlt className="spinner-border text-primary" /></td></tr>
              ) : filieres.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-5 text-muted">Aucune filière trouvée</td></tr>
              ) : (
                filieres.map((f) => (
                  <tr key={f.id}>
                    <td className="px-4">
                      <div className="d-flex align-items-center">
                        <div className="bg-light p-2 rounded me-3 text-primary"><BiBookBookmark size={18}/></div>
                        <span className="fw-bold text-dark">{f.intitule}</span>
                      </div>
                    </td>
                    <td>
                      {/* BACKGROUND BLEU/INFO RETIRÉ ICI */}
                      <div className="text-dark d-flex align-items-center">
                        <BiBuildings className="me-2 text-muted"/>
                        {f.departement?.nomDep || 'N/A'}
                      </div>
                    </td>
                    <td className="text-muted small">
                      <div style={{maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                        {f.description || '---'}
                      </div>
                    </td>
                    {isAdmin && (
                      <td className="text-end px-4">
                        <button className="btn btn-sm btn-light border me-2" onClick={() => openModal(f)}>
                          <BiEditAlt className="text-warning" />
                        </button>
                        <button className="btn btn-sm btn-light border" onClick={() => setConfirmDelete({ show: true, id: f.id })}>
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
        
        {/* FOOTER / PAGINATION */}
        <div className="card-footer bg-white d-flex justify-content-between align-items-center">
          <small className="text-muted">Page {pagination.page} / {pagination.lastPage}</small>
          <div className="btn-group">
            <button className="btn btn-sm btn-outline-secondary" disabled={!pagination.hasPreviousPage} onClick={() => setFilters(f => ({...f, page: f.page - 1}))}><BiChevronLeft/></button>
            <button className="btn btn-sm btn-primary px-3" disabled={!pagination.hasNextPage} onClick={() => setFilters(f => ({...f, page: f.page + 1}))}>Suivant</button>
          </div>
        </div>
      </div>

      {/* 🔹 MODAL FORMULAIRE */}
      {showModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <form onSubmit={handleSubmit}>
                <div className="modal-header bg-dark text-white border-0">
                  <h5 className="modal-title">{isEditing ? 'Modifier' : 'Nouvelle'} Filière</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-bold small">INTITULÉ DE LA FILIÈRE</label>
                    <input type="text" className="form-control" required value={formData.intitule} onChange={(e) => setFormData({ ...formData, intitule: e.target.value })} placeholder="ex: Informatique de Gestion" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold small">DÉPARTEMENT</label>
                    <select className="form-select" required value={formData.departementId} onChange={(e) => setFormData({ ...formData, departementId: e.target.value })}>
                      <option value="">Sélectionner un département...</option>
                      {departements.map(d => <option key={d.id} value={d.id}>{d.nomDep}</option>)}
                    </select>
                  </div>
                  <div className="mb-0">
                    <label className="form-label fw-bold small">DESCRIPTION (OPTIONNEL)</label>
                    <textarea className="form-control" rows="3" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}></textarea>
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
                <p className="text-muted small">Voulez-vous supprimer cette filière ?</p>
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

export default FiliereContent;