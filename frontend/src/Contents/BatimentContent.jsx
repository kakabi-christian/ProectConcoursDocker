import React, { useState, useEffect, useCallback } from 'react';
import { 
  BiSearch, BiLoaderAlt, BiPlus, BiEditAlt, BiTrash, 
  BiTime, BiBuildings, BiX, BiCheck
} from 'react-icons/bi';
import BatimentService from '../services/BatimentService';

const BatimentContent = () => {
  const [batiments, setBatiments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, lastPage: 1 });
  const [filters, setFilters] = useState({ page: 1, limit: 10 });
  
  // États pour le formulaire et suppression
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null); // ID du bâtiment à supprimer
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ nom: '', code: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 1. CHARGEMENT DES DONNÉES
  const loadBatiments = useCallback(async () => {
    setLoading(true);
    try {
      const result = await BatimentService.getAllBatiments(filters.page, filters.limit);
      if (result) {
        setBatiments(result.data || []);
        setPagination(result.meta || {});
      }
    } catch (err) {
      console.error("Erreur chargement bâtiments:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadBatiments();
  }, [loadBatiments]);

  // 2. LOGIQUE ACTIONS
  const handleOpenForm = (batiment = null) => {
    setErrorMessage('');
    if (batiment) {
      setFormData({ nom: batiment.nom, code: batiment.code });
      setEditingId(batiment.id);
    } else {
      setFormData({ nom: '', code: '' });
      setEditingId(null);
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      if (editingId) {
        await BatimentService.updateBatiment(editingId, formData);
      } else {
        await BatimentService.createBatiment(formData);
      }
      setShowModal(false);
      loadBatiments();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    setIsSubmitting(true);
    try {
      await BatimentService.deleteBatiment(showDeleteConfirm);
      setShowDeleteConfirm(null);
      loadBatiments();
    } catch (err) {
      setErrorMessage("Impossible de supprimer : ce bâtiment contient probablement des salles.");
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.lastPage) {
      setFilters(prev => ({ ...prev, page: newPage }));
    }
  };

  return (
    <div className="container-fluid p-4 bg-light min-vh-100">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Gestion des Bâtiments</h2>
          <p className="text-muted mb-0">Configuration des structures physiques</p>
        </div>
        <button className="btn btn-primary rounded-pill px-4 shadow-sm fw-bold d-flex align-items-center" onClick={() => handleOpenForm()}>
          <BiPlus className="me-2" /> Nouveau Bâtiment
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="card shadow-sm border-0 mb-4 p-3 rounded-4">
        <div className="row g-3 align-items-center">
          <div className="col-md-4">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-primary"><BiSearch /></span>
              <input type="text" className="form-control border-start-0 shadow-none" placeholder="Rechercher..." />
            </div>
          </div>
          <div className="col-md-2">
            {loading && <div className="text-primary d-flex align-items-center"><BiLoaderAlt className="spinner-border spinner-border-sm me-2" /><small>Chargement...</small></div>}
          </div>
        </div>
      </div>

      {/* Tableau */}
      <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-primary text-white">
              <tr>
                <th className="px-4 py-3 border-0">BÂTIMENT</th>
                <th className="py-3 border-0">CODE</th>
                <th className="py-3 border-0 text-center">SALLES</th>
                <th className="py-3 border-0">CRÉATION</th>
                <th className="text-end px-4 py-3 border-0">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {batiments.map((b) => (
                <tr key={b.id}>
                  <td className="px-4">
                    <div className="d-flex align-items-center">
                      <div className="bg-primary-subtle rounded-circle p-2 me-3 text-primary"><BiBuildings size={20} /></div>
                      <div><div className="fw-bold text-dark">{b.nom}</div><small className="text-muted">ID: {b.id.substring(0,8)}</small></div>
                    </div>
                  </td>
                  <td><span className="badge bg-info-subtle text-info px-3 py-2 rounded-pill fw-bold">{b.code}</span></td>
                  <td className="text-center fw-bold text-primary">{b._count?.salles || 0}</td>
                  <td><div className="small text-muted"><BiTime className="me-1" />{new Date(b.createdAt).toLocaleDateString()}</div></td>
                  <td className="text-end px-4">
                    <button className="btn btn-light btn-sm text-primary me-2 rounded-circle" onClick={() => handleOpenForm(b)}><BiEditAlt size={18} /></button>
                    <button className="btn btn-light btn-sm text-danger rounded-circle" onClick={() => setShowDeleteConfirm(b.id)}><BiTrash size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="card-footer bg-white border-0 py-3">
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <small className="text-muted">Total: {pagination.total} bâtiments</small>
            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${filters.page === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => handlePageChange(filters.page - 1)}>Précédent</button>
                </li>
                {[...Array(pagination.lastPage)].map((_, i) => (
                  <li key={i} className={`page-item ${filters.page === i + 1 ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => handlePageChange(i + 1)}>{i + 1}</button>
                  </li>
                ))}
                <li className={`page-item ${filters.page === pagination.lastPage ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => handlePageChange(filters.page + 1)}>Suivant</button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      {/* MODAL FORMULAIRE (ADD/EDIT) */}
      {showModal && (
        <div className="modal-backdrop position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
          <div className="card shadow-lg border-0 rounded-4 w-100 mx-3" style={{ maxWidth: '450px' }}>
            <div className="card-header bg-primary text-white p-3 d-flex justify-content-between align-items-center border-0 rounded-top-4">
              <h5 className="mb-0 fw-bold">{editingId ? "Modifier Bâtiment" : "Nouveau Bâtiment"}</h5>
              <button className="btn text-white p-0" onClick={() => setShowModal(false)}><BiX size={24}/></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="card-body p-4">
                {errorMessage && <div className="alert alert-danger small py-2">{errorMessage}</div>}
                <div className="mb-3">
                  <label className="form-label fw-bold small">NOM DU BÂTIMENT</label>
                  <input type="text" className="form-control shadow-none" value={formData.nom} onChange={(e) => setFormData({...formData, nom: e.target.value})} required />
                </div>
                <div className="mb-1">
                  <label className="form-label fw-bold small">CODE PRÉFIXE</label>
                  <input type="text" className="form-control shadow-none" maxLength="4" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})} required />
                </div>
                <small className="text-muted italic">Sert à générer les salles (ex: {formData.code || 'CODE'}101)</small>
              </div>
              <div className="card-footer bg-light p-3 d-flex justify-content-end gap-2 rounded-bottom-4 border-0">
                <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setShowModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary rounded-pill px-4" disabled={isSubmitting}>
                  {isSubmitting ? <BiLoaderAlt className="spinner-border spinner-border-sm"/> : <BiCheck className="me-1"/>}
                  {editingId ? "Mettre à jour" : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL SUPPRESSION */}
      {showDeleteConfirm && (
        <div className="modal-backdrop position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1060 }}>
          <div className="card border-0 rounded-4 shadow-lg mx-3" style={{ maxWidth: '400px' }}>
            <div className="card-body p-4 text-center">
              <div className="text-danger mb-3"><BiTrash size={50} /></div>
              <h5 className="fw-bold">Confirmation</h5>
              <p className="text-muted">Êtes-vous sûr de vouloir supprimer ce bâtiment ? Cette action est irréversible.</p>
              {errorMessage && <div className="text-danger small fw-bold mb-2">{errorMessage}</div>}
              <div className="d-flex justify-content-center gap-2 mt-4">
                <button className="btn btn-light rounded-pill px-4" onClick={() => setShowDeleteConfirm(null)}>Annuler</button>
                <button className="btn btn-danger rounded-pill px-4" onClick={confirmDelete} disabled={isSubmitting}>
                  {isSubmitting ? "Suppression..." : "Supprimer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatimentContent;