import React, { useEffect, useState } from 'react';
import AdminService from '../services/AdminService';
import RoleService from '../services/RoleService';
import { 
  Plus, UserCheck, Trash2, Edit3, ChevronLeft, 
  ChevronRight, Mail, MapPin, Building, Phone, 
  Shield, Globe, Search
} from 'lucide-react';

const COLORS = {
  primary: "#1E90FF",
  success: "#25963F",
  danger: "#EF4444",
  background: "#F1F5F9"
};

const CAMEROON_REGIONS = [
  { value: "ADAMAOUA", label: "Adamaoua" },
  { value: "CENTRE", label: "Centre" },
  { value: "EST", label: "Est" },
  { value: "EXTREME_NORD", label: "Extrême-Nord" },
  { value: "LITTORAL", label: "Littoral" },
  { value: "NORD", label: "Nord" },
  { value: "NORD_OUEST", label: "Nord-Ouest" },
  { value: "OUEST", label: "Ouest" },
  { value: "SUD", label: "Sud" },
  { value: "SUD_OUEST", label: "Sud-Ouest" }
];

export default function AdminContent() {
  const [admins, setAdmins] = useState([]);
  const [roles, setRoles] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, lastPage: 1 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentAdminId, setCurrentAdminId] = useState(null);

  const [formData, setFormData] = useState({
    email: '', password: '', nom: '', prenom: '',
    telephone: '', region: '', userType: 'ADMIN',
    departementId: '', roleId: ''
  });

  useEffect(() => {
    fetchAdmins(1);
    loadDependencies();
  }, []);

  const fetchAdmins = async (page) => {
    setLoading(true);
    try {
      const result = await AdminService.getAllAdmins(page, 5);
      setAdmins(result.data);
      setMeta(result.meta);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const loadDependencies = async () => {
    try {
      const rolesRes = await RoleService.getAll(1, 50);
      setRoles(rolesRes.data);
    } catch (error) { console.error(error); }
  };

  const handleOpenCreate = () => {
    setIsEditMode(false);
    setFormData({
      email: '', password: '', nom: '', prenom: '',
      telephone: '', region: '', userType: 'ADMIN',
      departementId: '', roleId: ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (admin) => {
    setIsEditMode(true);
    setCurrentAdminId(admin.id);
    setFormData({
      email: admin.email,
      password: '', 
      nom: admin.nom,
      prenom: admin.prenom,
      telephone: admin.telephone || '',
      region: admin.region || '',
      userType: admin.userType,
      departementId: admin.admin?.departementId || '',
      roleId: admin.roles[0]?.id || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer cet administrateur ?")) {
      try {
        await AdminService.deleteAdmin(id);
        fetchAdmins(meta.page);
      } catch (error) { alert(error.message); }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        const updatePayload = { ...formData };
        if (!updatePayload.password) delete updatePayload.password;
        await AdminService.updateAdmin(currentAdminId, updatePayload);
      } else {
        await AdminService.createAdmin(formData);
      }
      setShowModal(false);
      fetchAdmins(isEditMode ? meta.page : 1);
    } catch (error) { alert(error.message); }
  };

  return (
    <div className="p-4 min-vh-100" style={{ backgroundColor: COLORS.background }}>
      {/* Header */}
      <div className="row align-items-center mb-4 g-3">
        <div className="col-md-6">
          <h2 className="fw-bold text-dark m-0" style={{ letterSpacing: '-1px' }}>Équipe Administrative</h2>
          <p className="text-secondary m-0">Gestion des accès et des responsables du concours</p>
        </div>
        <div className="col-md-6 d-flex justify-content-md-end gap-3">
          <div className="bg-white px-3 py-2 rounded-3 shadow-sm d-flex align-items-center gap-2 border">
            <UserCheck size={18} className="text-primary" />
            <span className="fw-bold">{meta.total}</span> <span className="text-muted small">Total</span>
          </div>
          <button 
            onClick={handleOpenCreate}
            className="btn shadow-sm d-flex align-items-center gap-2 px-4 text-white border-0 transition-all"
            style={{ backgroundColor: COLORS.success, borderRadius: '10px' }}
          >
            <Plus size={20} /> <span className="fw-bold">Nouvel Admin</span>
          </button>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
        <div className="card-body p-3 d-flex align-items-center gap-2 text-muted">
          <Search size={18} />
          <input type="text" className="form-control border-0 shadow-none bg-transparent" placeholder="Filtrer par nom, email ou matricule..." />
        </div>
      </div>

      {/* Table */}
      <div className="card border-0 shadow-sm" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-white border-bottom">
              <tr>
                <th className="ps-4 py-4 text-secondary small fw-bold">ADMINISTRATEUR</th>
                <th className="py-4 text-secondary small fw-bold">LOCALISATION & CONTACT</th>
                <th className="py-4 text-secondary small fw-bold">RÔLE / DÉPT</th>
                <th className="pe-4 py-4 text-secondary small fw-bold text-end">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="text-center py-5"><div className="spinner-border text-primary border-3"></div></td></tr>
              ) : (
                admins.map((admin) => (
                  <tr key={admin.id} className="bg-white">
                    <td className="ps-4 py-3">
                      <div className="d-flex align-items-center gap-3">
                        <div className="avatar-placeholder d-flex align-items-center justify-content-center fw-bold text-primary" 
                             style={{ width: '42px', height: '42px', backgroundColor: '#E0F2FE', borderRadius: '12px' }}>
                          {admin.prenom?.[0]}{admin.nom?.[0]}
                        </div>
                        <div>
                          <div className="fw-bold text-dark">{admin.fullName}</div>
                          <code className="text-primary small bg-light px-2 rounded" style={{ fontSize: '10px' }}>{admin.codeAdmin}</code>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="d-flex flex-column gap-1">
                        <div className="d-flex align-items-center gap-2 text-dark small fw-medium">
                          <Mail size={14} className="text-muted" /> {admin.email}
                        </div>
                        <div className="d-flex align-items-center gap-2 text-muted small">
                          <MapPin size={14} /> {admin.region || 'Non définie'}
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <Shield size={14} className="text-warning" />
                        <span className="badge rounded-pill fw-bold" style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>
                          {admin.roles?.[0]?.name || 'Membre'}
                        </span>
                      </div>
                      <div className="d-flex align-items-center gap-2 text-muted small">
                        <Building size={14} /> {admin.departement?.intitule || 'Services Généraux'}
                      </div>
                    </td>
                    <td className="pe-4 py-3 text-end">
                      <button onClick={() => handleOpenEdit(admin)} className="btn btn-light btn-sm rounded-3 p-2 border shadow-sm hover-primary me-2">
                        <Edit3 size={16} className="text-primary" />
                      </button>
                      <button onClick={() => handleDelete(admin.id)} className="btn btn-light btn-sm rounded-3 p-2 border shadow-sm hover-danger">
                        <Trash2 size={16} className="text-danger" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 bg-white border-top d-flex justify-content-between align-items-center">
          <small className="fw-medium text-muted">Page {meta.page} sur {meta.lastPage}</small>
          <div className="d-flex gap-2">
            <button className="btn btn-sm border-0 bg-light rounded-circle p-2" disabled={meta.page <= 1} onClick={() => fetchAdmins(meta.page - 1)}><ChevronLeft size={20}/></button>
            <button className="btn btn-sm border-0 bg-light rounded-circle p-2" disabled={meta.page >= meta.lastPage} onClick={() => fetchAdmins(meta.page + 1)}><ChevronRight size={20}/></button>
          </div>
        </div>
      </div>

      {/* Modale */}
      {showModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 1050, backdropFilter: 'blur(8px)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-2xl" style={{ borderRadius: '24px' }}>
              <div className="modal-header border-0 p-4 pb-0">
                <div>
                  <h4 className="fw-bold m-0 text-dark">{isEditMode ? "Modifier l'Administrateur" : "Nouvel Administrateur"}</h4>
                  <p className="text-muted small m-0">Veuillez renseigner les accès et informations de profil.</p>
                </div>
                <button type="button" className="btn-close shadow-none" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  <div className="row g-4">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-secondary">NOM</label>
                      <input 
                        type="text" 
                        className="form-control bg-light border-0 py-2" 
                        placeholder="ex: MBARGA" 
                        value={formData.nom} 
                        required 
                        onChange={(e) => setFormData({...formData, nom: e.target.value})} 
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-secondary">PRÉNOM</label>
                      <input 
                        type="text" 
                        className="form-control bg-light border-0 py-2" 
                        placeholder="ex: Jean-Paul" 
                        value={formData.prenom} 
                        required 
                        onChange={(e) => setFormData({...formData, prenom: e.target.value})} 
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-secondary">EMAIL PROFESSIONNEL</label>
                      <input 
                        type="email" 
                        className="form-control bg-light border-0 py-2" 
                        placeholder="nom.prenom@concours.cm" 
                        value={formData.email} 
                        required 
                        onChange={(e) => setFormData({...formData, email: e.target.value})} 
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-secondary">{isEditMode ? "NOUVEAU MOT DE PASSE (Optionnel)" : "MOT DE PASSE"}</label>
                      <input 
                        type="password" 
                        className="form-control bg-light border-0 py-2" 
                        placeholder={isEditMode ? "Laisser vide pour ne pas changer" : "Minimum 6 caractères"} 
                        required={!isEditMode} 
                        onChange={(e) => setFormData({...formData, password: e.target.value})} 
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-secondary">NUMÉRO DE TÉLÉPHONE</label>
                      <input 
                        type="tel" 
                        className="form-control bg-light border-0 py-2" 
                        placeholder="ex: 699 00 00 00" 
                        value={formData.telephone} 
                        onChange={(e) => setFormData({...formData, telephone: e.target.value})} 
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-secondary">RÉGION D'AFFECTATION</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-0"><Globe size={14}/></span>
                        <select 
                          className="form-select bg-light border-0 py-2" 
                          value={formData.region} 
                          required
                          onChange={(e) => setFormData({...formData, region: e.target.value})}
                        >
                          <option value="">Sélectionner la région...</option>
                          {CAMEROON_REGIONS.map((reg) => (
                            <option key={reg.value} value={reg.value}>{reg.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-bold text-secondary d-block">ATTRIBUTION DU RÔLE SYSTÈME</label>
                      <div className="row g-2">
                        {roles.map(r => (
                          <div className="col-md-4" key={r.id}>
                            <input 
                              type="radio" className="btn-check" name="roleSelect" id={`role-${r.id}`} 
                              checked={formData.roleId === r.id}
                              onChange={() => setFormData({...formData, roleId: r.id})} 
                            />
                            <label className="btn btn-outline-primary w-100 border-dashed py-2 small fw-bold" htmlFor={`role-${r.id}`}>
                              {r.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 p-4">
                  <button type="button" className="btn btn-light px-4 fw-bold" style={{ borderRadius: '12px' }} onClick={() => setShowModal(false)}>Annuler</button>
                  <button type="submit" className="btn text-white px-5 fw-bold shadow" style={{ backgroundColor: COLORS.primary, borderRadius: '12px' }}>
                    {isEditMode ? "Mettre à jour le profil" : "Créer le compte Admin"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .hover-primary:hover { background-color: #E0F2FE !important; border-color: #1E90FF !important; }
        .hover-danger:hover { background-color: #FEE2E2 !important; border-color: #EF4444 !important; }
        .border-dashed { border-style: dashed !important; border-width: 2px !important; }
        .btn-check:checked + label { background-color: #1E90FF !important; color: white !important; border-style: solid !important; }
        .avatar-placeholder { transition: all 0.3s ease; }
        tr:hover .avatar-placeholder { transform: scale(1.1); rotate: 3deg; }
      `}</style>
    </div>
  );
}