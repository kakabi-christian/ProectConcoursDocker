// src/components/PieceDossierContent.js
import React, { useState, useEffect, useCallback } from 'react';
import { 
  BiPlus, BiEditAlt, BiTrash, BiSearch, 
  BiChevronLeft, BiCheck, BiLoaderAlt, 
  BiErrorCircle, BiFile, BiCodeAlt, BiInfoCircle
} from 'react-icons/bi';
import pieceDossierService from '../services/PieceDossierService';

const PieceDossierContent = () => {
  // --- ÉTATS ---
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.userType === 'ADMIN' || user.userType === 'SUPERADMIN';

  // Filtres (Le backend n'a pas encore de pagination sur les pièces, mais on prépare la structure)
  const [filters, setFilters] = useState({ search: '' });

  // Formulaire
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    code: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Modals UI
  const [notification, setNotification] = useState({ show: false, title: '', message: '', type: 'error' });
  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null });

  // --- CHARGEMENT DES DONNÉES ---
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await pieceDossierService.findAll();
      // Filtrage local pour la recherche
      const filtered = data.filter(item => 
        item.nom.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.code.toLowerCase().includes(filters.search.toLowerCase())
      );
      setItems(filtered || []);
    } catch (err) {
      showNotify("Erreur", "Impossible de charger les types de pièces.", "error");
    } finally {
      setLoading(false);
    }
  }, [filters.search]);

  useEffect(() => {
    const timer = setTimeout(() => loadData(), 400);
    return () => clearTimeout(timer);
  }, [loadData]);

  // --- ACTIONS ---
  const showNotify = (title, message, type = 'error') => {
    setNotification({ show: true, title, message, type });
  };

  const openModal = (piece = null) => {
    if (!isAdmin) return;
    if (piece) {
      setIsEditing(true);
      setCurrentId(piece.id);
      setFormData({
        nom: piece.nom || '',
        code: piece.code || ''
      });
    } else {
      setIsEditing(false);
      setFormData({ nom: '', code: '' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEditing) {
        await pieceDossierService.update(currentId, formData);
      } else {
        await pieceDossierService.create(formData);
      }
      setShowModal(false);
      loadData();
      showNotify("Succès", "Type de pièce enregistré avec succès.", "success");
    } catch (err) {
      showNotify("Erreur", err.message || "Une erreur est survenue.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await pieceDossierService.remove(confirmDelete.id);
      setConfirmDelete({ show: false, id: null });
      loadData();
      showNotify("Supprimé", "La pièce a été supprimée.", "success");
    } catch (err) {
      showNotify("Erreur", "Cette pièce est probablement liée à un concours actif.", "error");
      setConfirmDelete({ show: false, id: null });
    }
  };

  return (
    <div className="container-fluid p-4 bg-light min-vh-100">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Pièces de Dossier</h2>
          <p className="text-muted small">Définissez les documents requis pour les concours</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary d-flex align-items-center shadow-sm px-4" onClick={() => openModal()}>
            <BiPlus className="me-2" /> Nouvelle Pièce
          </button>
        )}
      </div>

      {/* BARRE DE RECHERCHE */}
      <div className="card shadow-sm border-0 mb-4 p-3">
        <div className="input-group w-50">
          <span className="input-group-text bg-white border-end-0 text-muted"><BiSearch /></span>
          <input 
            type="text" className="form-control border-start-0 shadow-none" 
            placeholder="Rechercher par nom ou code (ex: photoCni)..." 
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
          />
        </div>
      </div>

      {/* TABLEAU */}
      <div className="card shadow-sm border-0 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-primary text-white">
              <tr>
                <th className="px-4 py-3">NOM DE LA PIÈCE</th>
                <th className="py-3">CODE TECHNIQUE (DB)</th>
                <th className="py-3">DATE CRÉATION</th>
                {isAdmin && <th className="text-end px-4">ACTIONS</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="text-center py-5"><BiLoaderAlt className="spinner-border text-primary" /></td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-5 text-muted">Aucune pièce configurée</td></tr>
              ) : (
                items.map(item => (
                  <tr key={item.id}>
                    <td className="px-4">
                      <div className="d-flex align-items-center">
                        <div className="bg-light p-2 rounded me-3 text-primary"><BiFile size={20}/></div>
                        <span className="fw-bold text-dark">{item.nom}</span>
                      </div>
                    </td>
                    <td>
                      <code className="bg-light text-primary px-2 py-1 rounded small">
                        <BiCodeAlt className="me-1"/> {item.code}
                      </code>
                    </td>
                    <td>
                      <div className="small text-muted">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </div>
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
      </div>

      {/* MODAL FORMULAIRE */}
      {showModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <form onSubmit={handleSubmit}>
                <div className="modal-header bg-dark text-white border-0">
                  <h5 className="modal-title fw-bold">{isEditing ? 'Modifier' : 'Ajouter'} une Pièce</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body p-4">
                  <div className="alert alert-info py-2 d-flex align-items-center small border-0">
                    <BiInfoCircle className="me-2" size={20}/>
                    Le code doit correspondre exactement au champ dans la table Dossier.
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold small text-uppercase">Nom de la pièce</label>
                    <input 
                      type="text" className="form-control shadow-none" 
                      placeholder="ex: Certificat Médical" required 
                      value={formData.nom} 
                      onChange={e => setFormData({...formData, nom: e.target.value})} 
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold small text-uppercase">Code Technique (ex: photoCni)</label>
                    <input 
                      type="text" className="form-control shadow-none font-monospace" 
                      placeholder="ex: photoCertificat" required 
                      value={formData.code} 
                      onChange={e => setFormData({...formData, code: e.target.value})} 
                    />
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

      {/* NOTIFICATIONS & CONFIRMATION (Idem à ton AnneeContent) */}
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
              <h6 className="fw-bold">Supprimer cette pièce ?</h6>
              <p className="small text-muted mb-4">Assurez-vous qu'aucun concours n'utilise ce document avant de confirmer.</p>
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

export default PieceDossierContent;