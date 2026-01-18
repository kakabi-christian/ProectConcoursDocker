import React, { useState, useEffect, useCallback } from 'react';
import { 
  BiCloudUpload, BiTrash, BiSearch, BiFile, 
  BiChevronLeft, BiLoaderAlt, BiDownload,
  BiCalendar, BiBookBookmark, BiCheck, BiXCircle
} from 'react-icons/bi';
import archiveService, { getAnnees } from '../services/archives2Service';
import epreuveService from '../services/epreuveService';

const ContentArchive = () => {
  // --- ÉTATS ---
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [annees, setAnnees] = useState([]); 
  const [epreuves, setEpreuves] = useState([]);
  
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : {};
  const isAdmin = user.userType === 'ADMIN'|| user.userType === 'SUPERADMIN';

  // Filtres et Pagination
  const [pagination, setPagination] = useState({ total: 0, page: 1, lastPage: 1 });
  const [filters, setFilters] = useState({ search: '', anneeId: '', epreuveId: '', page: 1, limit: 10 });

  // Modal Upload
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({ epreuveId: '', anneeId: '' });

  // Notifications
  const [notification, setNotification] = useState({ show: false, message: '', type: 'error' });

  // --- CHARGEMENT ---
  const showNotify = (message, type = 'error') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 4000);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await archiveService.getAll(filters);
      setItems(response?.data || []);
      setPagination(response?.pagination || { total: 0, page: 1, lastPage: 1 });
    } catch (err) {
      showNotify("Impossible de charger les archives.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadDependencies = async () => {
    try {
      const [aRes, eRes] = await Promise.all([
        getAnnees(),
        epreuveService.getAll({ limit: 100 })
      ]);
      
      // Extraction selon si le service renvoie la réponse axios ou data directement
      const listAnnees = aRes?.data || aRes;
      const listEpreuves = eRes?.data || eRes;

      setAnnees(Array.isArray(listAnnees) ? listAnnees : []);
      setEpreuves(Array.isArray(listEpreuves) ? listEpreuves : []);
    } catch (err) {
      console.error("Erreur dépendances:", err);
      setAnnees([]);
      setEpreuves([]);
    }
  };

  useEffect(() => {
    loadDependencies();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => loadData(), 400);
    return () => clearTimeout(timer);
  }, [loadData]);

  // --- ACTIONS ---
  const handleFileChange = (e) => setSelectedFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return showNotify("Veuillez sélectionner un document.");

    const data = new FormData();
    data.append('file', selectedFile);
    data.append('epreuveId', formData.epreuveId);
    data.append('anneeId', formData.anneeId);

    setSubmitting(true);
    try {
      await archiveService.create(data);
      setShowModal(false);
      setSelectedFile(null);
      loadData();
      showNotify("Document archivé avec succès.", "success");
    } catch (err) {
      showNotify("Échec de l'envoi du fichier.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer cette archive ?")) {
      try {
        await archiveService.delete(id);
        loadData();
        showNotify("L'archive a été effacée.", "success");
      } catch (err) {
        showNotify("Action impossible.");
      }
    }
  };

  return (
    <div className="container-fluid p-4 bg-light min-vh-100">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Archives Numériques</h2>
          <p className="text-muted small">Gestion des épreuves et ressources PDF</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary d-flex align-items-center shadow-sm px-4" onClick={() => setShowModal(true)}>
            <BiCloudUpload className="me-2" size={20} /> Archiver un document
          </button>
        )}
      </div>

      {/* FILTRES */}
      <div className="card shadow-sm border-0 mb-4 p-3">
        <div className="row g-3">
          <div className="col-md-4">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted"><BiSearch /></span>
              <input 
                type="text" className="form-control border-start-0 shadow-none" 
                placeholder="Rechercher une matière..." 
                value={filters.search}
                onChange={(e) => setFilters(f => ({ ...f, search: e.target.value, page: 1 }))}
              />
            </div>
          </div>
          <div className="col-md-3">
            <select 
              className="form-select shadow-none"
              value={filters.anneeId}
              onChange={(e) => setFilters(f => ({ ...f, anneeId: e.target.value, page: 1 }))}
            >
              <option value="">Toutes les années</option>
              {Array.isArray(annees) && annees.map(a => (
                <option key={a.id} value={a.id}>{a.libelle}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* TABLEAU */}
      <div className="card shadow-sm border-0 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-primary text-white">
              <tr>
                <th className="px-4 py-3 border-0">DOCUMENT</th>
                <th className="py-3 border-0 text-center">ANNÉE</th>
                <th className="py-3 border-0">ÉPREUVE</th>
                <th className="py-3 border-0">DATE</th>
                <th className="text-end px-4 border-0">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center py-5"><BiLoaderAlt className="spinner-border text-primary" /></td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-5 text-muted">Aucune archive disponible</td></tr>
              ) : (
                items.map(item => (
                  <tr key={item.id} className="border-bottom">
                    <td className="px-4">
                      <div className="d-flex align-items-center">
                        <div className="bg-danger-subtle p-2 rounded me-3 text-danger"><BiFile size={24}/></div>
                        <div>
                          <div className="fw-bold text-dark small">ID: {item.id.slice(0, 8)}</div>
                          <small className="text-primary cursor-pointer fw-medium" onClick={() => window.open(`http://localhost:3000${item.fileUrl}`, '_blank')}>Voir le document</small>
                        </div>
                      </div>
                    </td>
                    <td className="text-center">
                      <span className="badge bg-info-subtle text-info px-3 py-2 fw-normal">
                        <BiCalendar className="me-1"/> {item.annee?.libelle || 'N/A'}
                      </span>
                    </td>
                    <td className="text-muted small">
                       <BiBookBookmark className="me-1"/> {item.epreuve?.nomEpreuve}
                    </td>
                    <td className="small text-muted">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="text-end px-4">
                      <a href={`http://localhost:3000${item.fileUrl}`} download className="btn btn-sm btn-light border me-2">
                        <BiDownload className="text-success"/>
                      </a>
                      {isAdmin && (
                        <button className="btn btn-sm btn-light border" onClick={() => handleDelete(item.id)}>
                          <BiTrash className="text-danger"/>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="card-footer bg-white d-flex justify-content-between align-items-center py-3">
          <small className="text-muted">Total : {pagination.total} épreuves</small>
          <div className="btn-group">
            <button className="btn btn-sm btn-outline-primary" disabled={pagination.page <= 1} onClick={() => setFilters(f => ({...f, page: f.page - 1}))}><BiChevronLeft/></button>
            <button className="btn btn-sm btn-primary px-3" disabled>{pagination.page}</button>
            <button className="btn btn-sm btn-outline-primary" disabled={pagination.page >= pagination.lastPage} onClick={() => setFilters(f => ({...f, page: f.page + 1}))}>Suivant</button>
          </div>
        </div>
      </div>

      {/* MODAL UPLOAD */}
      {showModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0">
              <form onSubmit={handleSubmit}>
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title">Nouvelle Archive</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Épreuve</label>
                    <select className="form-select" required value={formData.epreuveId} onChange={e => setFormData({...formData, epreuveId: e.target.value})}>
                      <option value="">Choisir l'épreuve...</option>
                      {Array.isArray(epreuves) && epreuves.map(e => <option key={e.id} value={e.id}>{e.nomEpreuve}</option>)}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Année</label>
                    <select className="form-select" required value={formData.anneeId} onChange={e => setFormData({...formData, anneeId: e.target.value})}>
                      <option value="">Choisir l'année...</option>
                      {Array.isArray(annees) && annees.map(a => <option key={a.id} value={a.id}>{a.libelle}</option>)}
                    </select>
                  </div>
                  <div className="mt-4 p-3 border border-dashed rounded text-center bg-light">
                    <input type="file" className="form-control" onChange={handleFileChange} accept=".pdf,image/*" required />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Annuler</button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? <BiLoaderAlt className="spinner-border spinner-border-sm me-2"/> : <BiCheck className="me-2"/>}
                    Enregistrer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICATION */}
      {notification.show && (
        <div className="position-fixed bottom-0 end-0 m-4 shadow-lg" style={{ zIndex: 9999 }}>
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-danger'} border-0 d-flex align-items-center`}>
            {notification.message}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentArchive;