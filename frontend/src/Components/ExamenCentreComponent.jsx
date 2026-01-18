import React, { useState, useEffect, useCallback } from 'react';
import { 
  BiSearch, BiChevronLeft, BiPlus, BiEditAlt, 
  BiTrash, BiLoaderAlt, BiCheck, BiErrorCircle,
  BiMapPin, BiBuildings, BiUserCheck
} from 'react-icons/bi';
import centreExamenService from '../services/centreExamService';

const ExamenCentreComponent = () => {
  // --- ÉTATS ---
  const [centres, setCentres] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Récupération du rôle utilisateur
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.userType === 'ADMIN'|| user.userType === 'SUPERADMIN';

  // États du Formulaire (Modal)
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({ 
    intitule: '', 
    lieuCentre: '' 
  });
  const [submitting, setSubmitting] = useState(false);

  // États Notifications et Suppression
  const [notification, setNotification] = useState({ show: false, title: '', message: '', type: 'error' });
  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null });

  // Pagination et Recherche
  const [pagination, setPagination] = useState({ total: 0, page: 1, lastPage: 1, hasNextPage: false, hasPreviousPage: false });
  const [filters, setFilters] = useState({ search: '', page: 1, limit: 10 });

  // --- CHARGEMENT DES DONNÉES ---
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await centreExamenService.getAll(filters);
      setCentres(response.data || []);
      setPagination(response.pagination);
    } catch (err) {
      showNotify("Erreur", "Impossible de charger les centres d'examen.", "error");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => loadData(), 400);
    return () => clearTimeout(timer);
  }, [loadData]);

  // --- LOGIQUE DES ACTIONS ---
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
        lieuCentre: centre.lieuCentre || '' 
      });
    } else {
      setIsEditing(false);
      setFormData({ intitule: '', lieuCentre: '' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEditing) {
        await centreExamenService.update(currentId, formData);
      } else {
        await centreExamenService.create(formData);
      }
      setShowModal(false);
      loadData();
      showNotify("Succès", "Opération réussie !", "success");
    } catch (err) {
      showNotify("Erreur", "Échec de l'enregistrement.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const executeDelete = async () => {
    try {
      await centreExamenService.delete(confirmDelete.id);
      setConfirmDelete({ show: false, id: null });
      loadData();
      showNotify("Supprimé", "Le centre a été retiré avec succès.", "success");
    } catch (err) {
      setConfirmDelete({ show: false, id: null });
      showNotify("Erreur", "Impossible de supprimer ce centre.", "error");
    }
  };

  return (
    <div className="container-fluid p-4 bg-light min-vh-100">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Centres d'Examen</h2>
          <p className="text-muted small">Gestion des {pagination.total} centres disponibles</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary d-flex align-items-center shadow-sm px-4" onClick={() => openModal()}>
            <BiPlus className="me-2" /> Nouveau Centre
          </button>
        )}
      </div>

      {/* RECHERCHE */}
      <div className="card shadow-sm border-0 mb-4 p-3">
        <div className="input-group w-50">
          <span className="input-group-text bg-white border-end-0"><BiSearch /></span>
          <input 
            type="text" className="form-control border-start-0 shadow-none" 
            placeholder="Rechercher par nom ou localisation..." 
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
          />
        </div>
      </div>

      {/* TABLEAU DES CENTRES */}
      <div className="card shadow-sm border-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-primary text-white">
              <tr>
                <th className="px-4 py-3">NOM DU CENTRE</th>
                <th className="py-3">LIEU / LOCALISATION</th>
                <th className="py-3 text-center">STATISTIQUES</th>
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
                        <BiMapPin className="me-1 text-danger"/> {c.lieuCentre || 'Lieu non défini'}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className="badge bg-black bg-opacity-10 text-success px-3 py-2">
                        <BiUserCheck className="me-1"/> {c.countEnrollements || 0} enrôlés
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
        
        {/* FOOTER / PAGINATION */}
        <div className="card-footer bg-white d-flex justify-content-between align-items-center">
          <small className="text-muted">Page {pagination.page} / {pagination.lastPage}</small>
          <div className="btn-group">
            <button className="btn btn-sm btn-outline-secondary" disabled={!pagination.hasPreviousPage} onClick={() => setFilters(f => ({...f, page: f.page - 1}))}><BiChevronLeft/></button>
            <button className="btn btn-sm btn-primary px-3" disabled={!pagination.hasNextPage} onClick={() => setFilters(f => ({...f, page: f.page + 1}))}>Suivant</button>
          </div>
        </div>
      </div>

      {/* 🔹 MODAL AJOUT/MODIFICATION */}
      {showModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <form onSubmit={handleSubmit}>
                <div className="modal-header bg-dark text-white border-0">
                  <h5 className="modal-title">{isEditing ? 'Éditer' : 'Nouveau'} Centre d'Examen</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-bold small">NOM DU CENTRE</label>
                    <input 
                      type="text" className="form-control" required 
                      value={formData.intitule} 
                      onChange={(e) => setFormData({ ...formData, intitule: e.target.value })} 
                      placeholder="ex: Centre de Mermoz" 
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold small">LOCALISATION (OPTIONNEL)</label>
                    <input 
                      type="text" className="form-control" 
                      value={formData.lieuCentre} 
                      onChange={(e) => setFormData({ ...formData, lieuCentre: e.target.value })} 
                      placeholder="ex: Rue 1.042, Yaoundé" 
                    />
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
                <button className="btn btn-dark w-100 mt-3" onClick={() => setNotification({ ...notification, show: false })}>Fermer</button>
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
                <p className="text-muted small">Cette action est irréversible.</p>
                <div className="d-flex gap-2 mt-4">
                  <button className="btn btn-light border flex-grow-1" onClick={() => setConfirmDelete({ show: false, id: null })}>Non</button>
                  <button className="btn btn-danger flex-grow-1" onClick={executeDelete}>Supprimer</button>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamenCentreComponent;