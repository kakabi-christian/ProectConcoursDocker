import React, { useState } from 'react';
import { 
  BiUserCircle, BiEnvelope, BiShieldAlt, 
  BiCalendar, BiLockAlt, BiPhone, BiX, 
  BiCheckCircle, BiErrorCircle
} from 'react-icons/bi';
import { changePassword } from '../services/authService';

const ProfileContent = () => {
  // Récupération des données utilisateur
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // États pour le changement de mot de passe
  const [showPassModal, setShowPassModal] = useState(false);
  const [passData, setPassData] = useState({ oldPassword: '', newPassword: '' });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' });

  // Gérer le changement de mot de passe
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', msg: '' });

    try {
      await changePassword(passData.oldPassword, passData.newPassword);
      setStatus({ type: 'success', msg: 'Mot de passe modifié avec succès !' });
      setPassData({ oldPassword: '', newPassword: '' });
      setTimeout(() => setShowPassModal(false), 2000);
    } catch (err) {
      setStatus({ 
        type: 'danger', 
        msg: err.message || "Erreur lors de la modification. Vérifiez l'ancien mot de passe." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid p-4 bg-light min-vh-100">
      
      {/* HEADER */}
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-1">Mon Profil</h2>
        <p className="text-muted small">Consultez vos informations personnelles</p>
      </div>

      {/* CARD SIMPLE */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-4">
          
          {/* AVATAR ET NOM */}
          <div className="text-center mb-4">
            <div className="d-inline-block bg-primary bg-opacity-10 p-3 rounded-circle mb-3">
              <BiUserCircle size={70} className="text-primary" />
            </div>
            <h4 className="fw-bold mb-1 text-capitalize">
              {user.prenom || ''} {user.nom || user.username}
            </h4>
            <span className="badge bg-success bg-opacity-10 text-success px-3 py-2">
              <BiShieldAlt className="me-1" /> 
              {user.userType || 'CANDIDATE'}
            </span>
          </div>

          <hr className="my-4" />

          {/* INFORMATIONS */}
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <label className="text-muted small d-block mb-1">Email</label>
              <div className="d-flex align-items-center">
                <BiEnvelope className="me-2 text-primary" />
                <span className="fw-medium">{user.email || 'Non renseigné'}</span>
              </div>
            </div>

            <div className="col-md-6">
              <label className="text-muted small d-block mb-1">Téléphone</label>
              <div className="d-flex align-items-center">
                <BiPhone className="me-2 text-primary" />
                <span className="fw-medium">{user.telephone || 'Non renseigné'}</span>
              </div>
            </div>

            <div className="col-md-6">
              <label className="text-muted small d-block mb-1">Date d'inscription</label>
              <div className="d-flex align-items-center">
                <BiCalendar className="me-2 text-primary" />
                <span className="fw-medium">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Récemment'}
                </span>
              </div>
            </div>

            <div className="col-md-6">
              <label className="text-muted small d-block mb-1">Statut</label>
              <div className="d-flex align-items-center">
                <span className="fw-medium text-success">
                  {user.userType?.toLowerCase() || 'candidate'} - Actif
                </span>
              </div>
            </div>
          </div>

          <hr className="my-4" />

          {/* BOUTON CHANGER MOT DE PASSE */}
          {!showPassModal && (
            <div className="text-center">
              <button 
                className="btn btn-primary px-4"
                onClick={() => setShowPassModal(true)}
              >
                <BiLockAlt className="me-2" />
                Changer le mot de passe
              </button>
            </div>
          )}

          {/* FORMULAIRE MOT DE PASSE */}
          {showPassModal && (
            <div className="p-4 border rounded-3 bg-light">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold mb-0">
                  <BiLockAlt className="me-2"/>
                  Changer le mot de passe
                </h6>
                <button 
                  className="btn btn-sm btn-light" 
                  onClick={() => setShowPassModal(false)}
                >
                  <BiX size={20}/>
                </button>
              </div>

              {status.msg && (
                <div className={`alert alert-${status.type} d-flex align-items-center py-2 mb-3`}>
                  {status.type === 'success' ? <BiCheckCircle className="me-2"/> : <BiErrorCircle className="me-2"/>}
                  {status.msg}
                </div>
              )}

              <form onSubmit={handleChangePassword}>
                <div className="mb-3">
                  <label className="form-label small">Ancien mot de passe</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    placeholder="Entrez votre ancien mot de passe"
                    required
                    value={passData.oldPassword}
                    onChange={(e) => setPassData({...passData, oldPassword: e.target.value})}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small">Nouveau mot de passe</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    placeholder="Entrez votre nouveau mot de passe"
                    required
                    value={passData.newPassword}
                    onChange={(e) => setPassData({...passData, newPassword: e.target.value})}
                  />
                </div>

                <div className="text-end">
                  <button 
                    type="submit" 
                    className="btn btn-primary px-4" 
                    disabled={loading}
                  >
                    {loading ? 'Modification...' : 'Valider'}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ProfileContent;