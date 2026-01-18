import React, { useState, useEffect, useCallback } from 'react';
import { 
  BiSearch, BiLoaderAlt, BiPlus, BiEditAlt, BiTrash, 
  BiTime, BiDoorOpen, BiX, BiCheck, BiBuildingHouse, BiGroup
} from 'react-icons/bi';
import SalleService from '../services/SalleService';
const SalleContent = () => {
  const [salles, setSalles] = useState([]);
  const [batimentsOptions, setBatimentsOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, lastPage: 1 });
  const [filters, setFilters] = useState({ page: 1, limit: 10 });
  
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ batimentId: '', capacite: 50 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 1. CHARGEMENT
  const loadInitialData = async () => {
    try {
      const options = await SalleService.getBatimentsForSelect();
      setBatimentsOptions(options || []);
    } catch (err) {
      console.error("Erreur options:", err);
    }
  };

  const loadSalles = useCallback(async () => {
    setLoading(true);
    try {
      const result = await SalleService.getAllSalles(filters.page, filters.limit);
      if (result) {
        setSalles(result.data || []);
        setPagination(result.meta || {});
      }
    } catch (err) {
      console.error("Erreur salles:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { loadInitialData(); }, []);
  useEffect(() => { loadSalles(); }, [loadSalles]);

  // 2. ACTIONS
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.lastPage) {
      setFilters(prev => ({ ...prev, page: newPage }));
    }
  };

  const handleOpenForm = (salle = null) => {
    setErrorMessage('');
    if (salle) {
      setFormData({ batimentId: salle.batimentId, capacite: salle.capacite });
      setEditingId(salle.id);
    } else {
      setFormData({ batimentId: '', capacite: 50 });
      setEditingId(null);
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.batimentId) return setErrorMessage("Sélectionnez un bâtiment.");
    setIsSubmitting(true);
    try {
      if (editingId) await SalleService.updateSalle(editingId, formData);
      else await SalleService.createSalle(formData);
      setShowModal(false);
      loadSalles();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Erreur lors de l'enregistrement");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    setIsSubmitting(true);
    try {
      await SalleService.deleteSalle(showDeleteConfirm);
      setShowDeleteConfirm(null);
      loadSalles();
    } catch (err) { setErrorMessage("Erreur suppression."); }
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="container-fluid p-4 bg-light min-vh-100">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Gestion des Salles</h2>
          <p className="text-muted mb-0">Répartition des capacités par bâtiment</p>
        </div>
        <button className="btn btn-primary rounded-pill px-4 shadow-sm fw-bold d-flex align-items-center" onClick={() => handleOpenForm()}>
          <BiPlus className="me-2" /> Nouvelle Salle
        </button>
      </div>

      {/* Recherche */}
      <div className="card shadow-sm border-0 mb-4 p-3 rounded-4">
        <div className="row g-3 align-items-center">
          <div className="col-md-4">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-primary"><BiSearch /></span>
              <input type="text" className="form-control border-start-0 shadow-none" placeholder="Rechercher une salle..." />
            </div>
          </div>
          {loading && <div className="col-md-2 text-primary small"><BiLoaderAlt className="spinner-border spinner-border-sm me-2"/>Chargement...</div>}
        </div>
      </div>

      {/* Tableau */}
      <div className="card shadow-sm border-0 rounded-4 overflow-hidden mb-4">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-primary text-white">
              <tr>
                <th className="px-4 py-3 border-0">CODE CLASSE</th>
                <th className="py-3 border-0">BÂTIMENT</th>
                <th className="py-3 border-0 text-center">CAPACITÉ</th>
                <th className="py-3 border-0">DATE CRÉATION</th>
                <th className="text-end px-4 py-3 border-0">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {salles.length > 0 ? salles.map((s) => (
                <tr key={s.id}>
                  <td className="px-4">
                    <div className="d-flex align-items-center">
                      <div className="bg-primary-subtle rounded-circle p-2 me-3 text-primary"><BiDoorOpen size={20} /></div>
                      <div className="fw-bold text-dark fs-5">{s.codeClasse}</div>
                    </div>
                  </td>
                  <td><div className="d-flex align-items-center text-muted"><BiBuildingHouse className="me-2" />{s.batiment?.nom}</div></td>
                  <td className="text-center">
                    <span className="badge bg-success-subtle text-success px-3 py-2 rounded-pill"><BiGroup className="me-1" /> {s.capacite} places</span>
                  </td>
                  <td><small className="text-muted"><BiTime className="me-1" />{new Date(s.createdAt).toLocaleDateString()}</small></td>
                  <td className="text-end px-4">
                    <button className="btn btn-light btn-sm text-primary me-2 rounded-circle" onClick={() => handleOpenForm(s)}><BiEditAlt size={18} /></button>
                    <button className="btn btn-light btn-sm text-danger rounded-circle" onClick={() => setShowDeleteConfirm(s.id)}><BiTrash size={18} /></button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="5" className="text-center py-5 text-muted">Aucune salle trouvée.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* --- SECTION PAGINATION --- */}
        <div className="card-footer bg-white border-0 py-3">
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <div className="text-muted small">
              Affichage de {salles.length} sur {pagination.total} salles
            </div>
            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${filters.page === 1 ? 'disabled' : ''}`}>
                  <button className="page-link shadow-none" onClick={() => handlePageChange(filters.page - 1)}>Précédent</button>
                </li>
                {[...Array(pagination.lastPage)].map((_, index) => (
                  <li key={index + 1} className={`page-item ${filters.page === index + 1 ? 'active' : ''}`}>
                    <button className="page-link shadow-none" onClick={() => handlePageChange(index + 1)}>
                      {index + 1}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${filters.page === pagination.lastPage ? 'disabled' : ''}`}>
                  <button className="page-link shadow-none" onClick={() => handlePageChange(filters.page + 1)}>Suivant</button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      {/* MODAL FORMULAIRE */}
      {showModal && (
        <div className="modal-backdrop position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
          <div className="card shadow-lg border-0 rounded-4 w-100 mx-3" style={{ maxWidth: '450px' }}>
            <div className="card-header bg-primary text-white p-3 d-flex justify-content-between align-items-center border-0 rounded-top-4">
              <h5 className="mb-0 fw-bold">{editingId ? "Modifier Salle" : "Nouvelle Salle"}</h5>
              <button className="btn text-white p-0" onClick={() => setShowModal(false)}><BiX size={24}/></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="card-body p-4">
                {errorMessage && <div className="alert alert-danger small py-2">{errorMessage}</div>}
                <div className="mb-3">
                  <label className="form-label fw-bold small">BÂTIMENT</label>
                  <select className="form-select shadow-none border-primary-subtle" value={formData.batimentId} onChange={(e) => setFormData({...formData, batimentId: e.target.value})} disabled={editingId} required>
                    <option value="">-- Choisir un bâtiment --</option>
                    {batimentsOptions.map(b => <option key={b.id} value={b.id}>{b.nom} ({b.code})</option>)}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold small">CAPACITÉ</label>
                  <input type="number" className="form-control shadow-none" value={formData.capacite} onChange={(e) => setFormData({...formData, capacite: parseInt(e.target.value)})} min="1" required />
                </div>
              </div>
              <div className="card-footer bg-light p-3 d-flex justify-content-end gap-2 rounded-bottom-4 border-0">
                <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setShowModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary rounded-pill px-4" disabled={isSubmitting}>
                  {isSubmitting ? <BiLoaderAlt className="spinner-border spinner-border-sm me-2"/> : <BiCheck className="me-1"/>}
                  {editingId ? "Mettre à jour" : "Générer"}
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
              <h5 className="fw-bold">Supprimer la salle ?</h5>
              <div className="d-flex justify-content-center gap-2 mt-4">
                <button className="btn btn-light rounded-pill px-4" onClick={() => setShowDeleteConfirm(null)}>Annuler</button>
                <button className="btn btn-danger rounded-pill px-4" onClick={confirmDelete} disabled={isSubmitting}>Supprimer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalleContent;