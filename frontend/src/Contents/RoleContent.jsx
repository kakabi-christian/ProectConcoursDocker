import React, { useEffect, useState } from 'react';
import RoleService from '../services/RoleService';
import PermissionService from '../services/PermissionService';
import { 
  Plus, ShieldCheck, Trash2, Edit3, ChevronLeft, 
  ChevronRight, Key, CheckCircle, X, Info 
} from 'lucide-react';

// Palette de couleurs constante
const COLORS = {
  primary: "#1E90FF",
  success: "#25963F",
  danger: "#EF4444",
  warning: "#F59E0B",
  surface: "#F8FAFC"
};

export default function RoleContent() {
  const [roles, setRoles] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, lastPage: 1 });
  const [loading, setLoading] = useState(true);

  // États Modales
  const [showModal, setShowModal] = useState(false);
  const [currentRole, setCurrentRole] = useState({ name: '', description: '' });
  const [isEditing, setIsEditing] = useState(false);

  const [showPermModal, setShowPermModal] = useState(false);
  const [allPermissions, setAllPermissions] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState([]);

  useEffect(() => {
    fetchRoles(1);
    loadPermissions();
  }, []);

  const fetchRoles = async (page) => {
    setLoading(true);
    try {
      const result = await RoleService.getAll(page, 5);
      setRoles(result.data);
      setMeta(result.meta);
    } catch (error) {
      console.error("Erreur chargement:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadPermissions = async () => {
    try {
      const result = await PermissionService.getAll(1, 100);
      setAllPermissions(result.data);
    } catch (error) {
      console.error("Erreur permissions:", error);
    }
  };

  // Actions
  const handleOpenModal = (role = { name: '', description: '' }) => {
    setCurrentRole(role);
    setIsEditing(!!role.id);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await RoleService.update(currentRole.id, currentRole);
      } else {
        await RoleService.create(currentRole);
      }
      setShowModal(false);
      fetchRoles(isEditing ? meta.page : 1);
    } catch (error) {
      alert("Erreur lors de l'enregistrement");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer ce rôle définitivement ?")) {
      try {
        await RoleService.delete(id);
        fetchRoles(meta.page);
      } catch (error) {
        alert("Action impossible : rôle lié à des utilisateurs.");
      }
    }
  };

  const handleOpenPermModal = async (role) => {
    setSelectedRole(role);
    try {
      const roleDetails = await RoleService.getById(role.id);
      const currentIds = roleDetails.permissions.map(p => p.permissionId);
      setSelectedPermissionIds(currentIds);
      setShowPermModal(true);
    } catch (error) {
      alert("Erreur de récupération");
    }
  };

  const togglePermission = (id) => {
    setSelectedPermissionIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSavePermissions = async () => {
    try {
      await RoleService.assignPermissions(selectedRole.id, selectedPermissionIds);
      setShowPermModal(false);
      fetchRoles(meta.page);
    } catch (error) {
      alert("Erreur d'assignation");
    }
  };

  return (
    <div className="p-4 min-vh-100" style={{ backgroundColor: COLORS.surface }}>
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-end mb-5">
        <div>
          <div className="d-flex align-items-center gap-2 mb-2">
            <ShieldCheck size={28} color={COLORS.primary} />
            <h2 className="fw-bold m-0" style={{ letterSpacing: '-0.5px' }}>Rôles & Accès</h2>
          </div>
          <p className="text-secondary m-0">Définissez les privilèges et les responsabilités du système</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="btn shadow-sm d-flex align-items-center gap-2 px-4 py-2 text-white transition-all"
          style={{ backgroundColor: COLORS.success, borderRadius: '10px', border: 'none' }}
        >
          <Plus size={18} strokeWidth={3} />
          <span className="fw-bold">Créer un rôle</span>
        </button>
      </div>

      {/* Main Table Card */}
      <div className="card border-0 shadow-sm" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr className="bg-white">
                <th className="ps-4 py-4 text-uppercase text-secondary small fw-bold" style={{ width: '25%' }}>Rôle</th>
                <th className="py-4 text-uppercase text-secondary small fw-bold" style={{ width: '40%' }}>Description</th>
                <th className="py-4 text-uppercase text-secondary small fw-bold text-center">Capacités</th>
                <th className="pe-4 py-4 text-uppercase text-secondary small fw-bold text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                  </td>
                </tr>
              ) : (
                roles.map((role) => (
                  <tr key={role.id} style={{ transition: 'all 0.2s' }}>
                    <td className="ps-4 py-3">
                      <div className="fw-bold text-dark fs-6">{role.name}</div>
                    </td>
                    <td className="py-3 text-secondary small">
                      {role.description || <span className="text-muted italic">Aucune description</span>}
                    </td>
                    <td className="py-3 text-center">
                      <span className="badge px-3 py-2 rounded-pill" 
                            style={{ backgroundColor: '#E0F2FE', color: '#0369A1', fontWeight: '600' }}>
                        {role.count?.permissions || 0} permissions
                      </span>
                    </td>
                    <td className="pe-4 py-3 text-end">
                      <div className="d-flex justify-content-end gap-1">
                        <button className="btn btn-icon-custom" onClick={() => handleOpenPermModal(role)} title="Permissions">
                          <Key size={18} color={COLORS.warning} />
                        </button>
                        <button className="btn btn-icon-custom" onClick={() => handleOpenModal(role)} title="Modifier">
                          <Edit3 size={18} color={COLORS.primary} />
                        </button>
                        <button className="btn btn-icon-custom" onClick={() => handleDelete(role.id)} title="Supprimer">
                          <Trash2 size={18} color={COLORS.danger} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Improved Pagination */}
        <div className="card-footer bg-white border-top py-3 px-4 d-flex justify-content-between align-items-center">
          <div className="text-muted small fw-medium">
            Affichage de la page <span className="text-dark fw-bold">{meta.page}</span> sur <span className="text-dark fw-bold">{meta.lastPage}</span>
          </div>
          <div className="btn-group gap-2">
            <button 
              className="btn btn-outline-light text-dark border shadow-sm btn-sm px-3 rounded-pill d-flex align-items-center gap-1" 
              disabled={meta.page <= 1} 
              onClick={() => fetchRoles(meta.page - 1)}
            >
              <ChevronLeft size={16} /> Précédent
            </button>
            <button 
              className="btn btn-sm px-3 rounded-pill text-white d-flex align-items-center gap-1 shadow-sm" 
              style={{ backgroundColor: COLORS.primary }}
              disabled={meta.page >= meta.lastPage} 
              onClick={() => fetchRoles(meta.page + 1)}
            >
              Suivant <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* --- MODALE RÔLE --- */}
      {showModal && (
        <div className="modal d-block animate-fade-in" style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)', zIndex: 1050, backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-2xl" style={{ borderRadius: '20px' }}>
              <div className="modal-header border-0 p-4 pb-0">
                <h5 className="fw-bold fs-4">{isEditing ? 'Éditer le rôle' : 'Nouveau rôle'}</h5>
                <button type="button" className="btn-close shadow-none" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-4">
                    <label className="form-label small fw-bold text-secondary text-uppercase">Nom du rôle</label>
                    <input 
                      type="text" className="form-control form-control-lg border-2 shadow-none" required
                      placeholder="ex: Administrateur"
                      style={{ borderRadius: '10px', fontSize: '1rem' }}
                      value={currentRole.name}
                      onChange={(e) => setCurrentRole({...currentRole, name: e.target.value})}
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label small fw-bold text-secondary text-uppercase">Description</label>
                    <textarea 
                      className="form-control border-2 shadow-none" rows="3"
                      placeholder="Décrivez les responsabilités..."
                      style={{ borderRadius: '10px' }}
                      value={currentRole.description}
                      onChange={(e) => setCurrentRole({...currentRole, description: e.target.value})}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-0 p-4 pt-0">
                  <button type="button" className="btn btn-light px-4 fw-bold" style={{ borderRadius: '10px' }} onClick={() => setShowModal(false)}>Annuler</button>
                  <button type="submit" className="btn text-white px-4 fw-bold shadow" style={{ backgroundColor: COLORS.primary, borderRadius: '10px' }}>
                    {isEditing ? 'Mettre à jour' : 'Créer le rôle'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- MODALE PERMISSIONS --- */}
      {showPermModal && (
        <div className="modal d-block animate-fade-in" style={{ backgroundColor: 'rgba(15, 23, 42, 0.7)', zIndex: 1060, backdropFilter: 'blur(6px)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered shadow-lg">
            <div className="modal-content border-0 overflow-hidden" style={{ borderRadius: '24px' }}>
              <div className="modal-header border-0 bg-dark p-4">
                <div>
                  <h5 className="fw-bold m-0 text-white">Gestion des Permissions</h5>
                  <span className="badge mt-2" style={{ backgroundColor: COLORS.primary }}>Rôle : {selectedRole?.name}</span>
                </div>
                <button type="button" className="btn-close btn-close-white shadow-none" onClick={() => setShowPermModal(false)}></button>
              </div>
              <div className="modal-body p-4 bg-light" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                <div className="row g-3">
                  {allPermissions.map(perm => {
                    const isSelected = selectedPermissionIds.includes(perm.id);
                    return (
                      <div className="col-md-6" key={perm.id}>
                        <div 
                          className={`p-3 border-2 rounded-4 d-flex align-items-start gap-3 transition-all ${isSelected ? 'border-primary bg-white shadow-sm' : 'border-transparent bg-white opacity-75'}`}
                          onClick={() => togglePermission(perm.id)}
                          style={{ cursor: 'pointer', transition: '0.2s', borderStyle: isSelected ? 'solid' : 'dashed' }}
                        >
                          <div className={`mt-1 rounded-circle p-1 ${isSelected ? 'text-primary' : 'text-muted'}`}>
                            {isSelected ? <CheckCircle size={20} fill="currentColor" color="white" /> : <div className="border rounded-circle" style={{ width: 20, height: 20 }} />}
                          </div>
                          <div className="flex-grow-1">
                            <div className={`fw-bold small ${isSelected ? 'text-primary' : 'text-dark'}`}>{perm.name}</div>
                            <div className="text-muted" style={{ fontSize: '11px', lineHeight: '1.3' }}>{perm.description}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="modal-footer border-0 p-4 bg-white shadow-lg">
                <button className="btn btn-light rounded-pill px-4 fw-bold" onClick={() => setShowPermModal(false)}>Annuler</button>
                <button className="btn text-white rounded-pill px-4 fw-bold shadow-sm" style={{ backgroundColor: COLORS.success }} onClick={handleSavePermissions}>
                  Enregistrer les modifications
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Styles inline pour les animations et boutons custom */}
      <style>{`
        .btn-icon-custom {
          padding: 8px;
          border-radius: 8px;
          border: 1px solid transparent;
          transition: all 0.2s;
          background: transparent;
        }
        .btn-icon-custom:hover {
          background: #F1F5F9;
          border-color: #E2E8F0;
          transform: translateY(-1px);
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .table tr:hover {
          background-color: #F8FAFC !important;
        }
      `}</style>
    </div>
  );
}