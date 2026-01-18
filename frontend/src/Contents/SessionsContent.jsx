import React, { useState, useEffect, useCallback } from 'react';
import { 
  BiPlus, BiEditAlt, BiTrash, BiSearch, 
  BiChevronLeft, BiCheck, BiLoaderAlt, 
  BiCalendar, BiTimeFive, BiErrorCircle, BiInfoCircle
} from 'react-icons/bi';
import sessionService from '../services/sessionService';

const SessionsContent = () => {
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
    nom: '',
    dateDebut: '',
    dateFin: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // UI Modals
  const [notification, setNotification] = useState({ show: false, title: '', message: '', type: 'error' });
  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null });

  // --- CHARGEMENT ---
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await sessionService.getAll(filters);
      setItems(response.data || []);
      setPagination(response.pagination);
    } catch (err) {
      showNotify("Erreur", "Impossible de charger les sessions.", "error");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => loadData(), 400);
    return () => clearTimeout(timer);
  }, [loadData]);

  // --- LOGIQUE DE STATUT ---
  const getStatusBadge = (start, end) => {
    const now = new Date();
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (now < startDate) return <span className="badge bg-info text-dark">À venir</span>;
    if (now > endDate) return <span className="badge bg-secondary">Clôturée</span>;
    return <span className="badge bg-success">En cours</span>;
  };

  // --- ACTIONS ---
  const showNotify = (title, message, type = 'error') => {
    setNotification({ show: true, title, message, type });
  };

  const openModal = (session = null) => {
    if (!isAdmin) return;
    if (session) {
      setIsEditing(true);
      setCurrentId(session.id);
      setFormData({
        nom: session.nom || '',
        dateDebut: session.dateDebut ? session.dateDebut.split('T')[0] : '',
        dateFin: session.dateFin ? session.dateFin.split('T')[0] : ''
      });
    } else {
      setIsEditing(false);
      setFormData({ nom: '', dateDebut: '', dateFin: '' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEditing) {
        await sessionService.update(currentId, formData);
      } else {
        await sessionService.create(formData);
      }
      setShowModal(false);
      loadData();
      showNotify("Succès", "Session mise à jour avec succès.", "success");
    } catch (err) {
      showNotify("Erreur", "Une erreur est survenue lors de l'enregistrement.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await sessionService.delete(confirmDelete.id);
      setConfirmDelete({ show: false, id: null });
      loadData();
      showNotify("Supprimé", "La session a été supprimée.", "success");
    } catch (err) {
      showNotify("Erreur", "Suppression impossible (Session liée à des données).", "error");
      setConfirmDelete({ show: false, id: null });
    }
  };

  return (
    <div className="container-fluid p-4 bg-light min-vh-100">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Sessions d'Examen</h2>
          <p className="text-muted small">Planification des périodes de concours</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary d-flex align-items-center shadow-sm px-4" onClick={() => openModal()}>
            <BiPlus className="me-2" /> Nouvelle Session
          </button>
        )}
      </div>

      {/* BARRE DE RECHERCHE */}
      <div className="card shadow-sm border-0 mb-4 p-3">
        <div className="input-group w-50">
          <span className="input-group-text bg-white border-end-0 text-muted"><BiSearch /></span>
          <input 
            type="text" className="form-control border-start-0" 
            placeholder="Rechercher une session..." 
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
                <th className="px-4 py-3">NOM DE LA SESSION</th>
                <th className="py-3 text-center">DATES</th>
                <th className="py-3 text-center">STATUT</th>
                <th className="py-3 text-center">INSCRITS</th>
                {isAdmin && <th className="text-end px-4">ACTIONS</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center py-5"><BiLoaderAlt className="spinner-border text-primary" /></td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-5 text-muted">Aucune session trouvée</td></tr>
              ) : (
                items.map(item => (
                  <tr key={item.id}>
                    <td className="px-4">
                      <div className="d-flex align-items-center">
                        <div className="bg-blue-soft p-2 rounded me-3 text-primary"><BiTimeFive size={20}/></div>
                        <span className="fw-bold">{item.nom}</span>
                      </div>
                    </td>
                    <td className="text-center">
                      <div className="small">
                        <span className="text-muted">Du</span> {new Date(item.dateDebut).toLocaleDateString()} <br/>
                        <span className="text-muted">Au</span> {new Date(item.dateFin).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="text-center">{getStatusBadge(item.dateDebut, item.dateFin)}</td>
                    <td className="text-center">
                      <span className="badge bg-light text-dark border">
                        {item.enrollementsCount || 0} candidat(s)
                      </span>
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
          <small className="text-muted">Total : {pagination.total} sessions</small>
          <div className="btn-group shadow-sm">
            <button className="btn btn-sm btn-outline-secondary" disabled={pagination.page <= 1} onClick={() => setFilters(f => ({...f, page: f.page - 1}))}><BiChevronLeft/></button>
            <button className="btn btn-sm btn-primary px-3" disabled={pagination.page >= pagination.lastPage} onClick={() => setFilters(f => ({...f, page: f.page + 1}))}>Suivant</button>
          </div>
        </div>
      </div>

      {/* MODAL FORMULAIRE */}
      {showModal && (
        <div className="modal d-block shadow" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0">
              <form onSubmit={handleSubmit}>
                <div className="modal-header bg-primary text-white border-0">
                  <h5 className="modal-title fw-bold">{isEditing ? 'Modifier' : 'Créer'} une Session</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-bold small text-uppercase">Nom de la session</label>
                    <input type="text" className="form-control shadow-none" placeholder="ex: Session Normale" required value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} />
                  </div>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-bold small text-uppercase">Date de début</label>
                      <input type="date" className="form-control shadow-none" required value={formData.dateDebut} onChange={e => setFormData({...formData, dateDebut: e.target.value})} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold small text-uppercase">Date de fin</label>
                      <input type="date" className="form-control shadow-none" required value={formData.dateFin} onChange={e => setFormData({...formData, dateFin: e.target.value})} />
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-light rounded border-start border-primary border-4">
                    <small className="text-muted"><BiInfoCircle className="me-1"/> Les dates déterminent la période durant laquelle les candidats peuvent s'inscrire.</small>
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
              <h6 className="fw-bold">Supprimer la session ?</h6>
              <p className="small text-muted">Cette action supprimera également les paramètres associés.</p>
              <div className="d-flex gap-2 mt-3">
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

export default SessionsContent;