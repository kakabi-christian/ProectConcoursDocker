import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sexe } from '../models/candidate';
import { registerCandidateStep2 } from '../services/authService';
import { getDepartements, getFilieresByDepartement } from '../services/archiveService';
import Header from './Header';
import Footer from './Footer';

export default function Step2Register() {
  const location = useLocation();
  const navigate = useNavigate();

  const [userId, setUserId] = useState(location.state?.userId || '');
  const [departements, setDepartements] = useState([]);
  const [departement, setDepartement] = useState('');
  const [filieres, setFilieres] = useState([]);
  const [filiere, setFiliere] = useState('');
  const [specialites, setSpecialites] = useState([]);
  const [specialiteId, setSpecialiteId] = useState('');

  const [dateNaissance, setDateNaissance] = useState('');
  const [lieuNaissance, setLieuNaissance] = useState('');
  const [sexe, setSexe] = useState('');
  const [nationalite, setNationalite] = useState('');
  const [ville, setVille] = useState('');
  const [nomPere, setNomPere] = useState('');
  const [telephonePere, setTelephonePere] = useState('');
  const [nomMere, setNomMere] = useState('');
  const [telephoneMere, setTelephoneMere] = useState('');

  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      const storedUserId = localStorage.getItem('userId');
      if (storedUserId) setUserId(storedUserId);
    }
  }, [userId]);

  useEffect(() => {
    getDepartements()
      .then(res => {
        const data = res.data?.data || res.data || res;
        if (Array.isArray(data)) setDepartements(data);
      })
      .catch(err => console.error("Erreur départements:", err));
  }, []);

  useEffect(() => {
    if (!departement) {
      setFilieres([]);
      return;
    }
    getFilieresByDepartement(departement).then(res => {
      const data = res.data?.data || res.data || res;
      setFilieres(Array.isArray(data) ? data : []);
    }).catch(err => console.error(err));
  }, [departement]);

  useEffect(() => {
    if (!filiere) {
      setSpecialites([]);
      return;
    }
    const fil = filieres.find(f => f.id === filiere);
    setSpecialites(fil?.specialites || []);
  }, [filiere, filieres]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      dateNaissance, lieuNaissance, sexe, nationalite, ville,
      nomPere, telephonePere, nomMere, telephoneMere, specialiteId,
    };

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const response = await registerCandidateStep2({ userId, data: payload });
      const candidateId = response.data?.candidate?.id || response.candidate?.id;
      
      localStorage.setItem('candidateId', candidateId);
      navigate('/Step3Register', { state: { candidateId } });
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l’enregistrement.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
        <div className="card shadow-lg p-5 border-0">
          <h2 className='mb-4 text-primary fw-bold'>Traitement de votre dossier...</h2>
          <div className="spinner-border text-primary" style={{ width: '4rem', height: '4rem' }} role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-4 lead text-muted">Nous enregistrons vos informations personnelles et académiques.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="container d-flex justify-content-center align-items-center my-5" style={{ minHeight: '85vh' }}>
        <div className="card p-4 shadow-lg border-0" style={{ width: '100%', maxWidth: '750px' }}>
          
          {/* BARRE DE PROGRESSION - 50% */}
          <div className="text-center mb-4">
            <h3 className="text-primary fw-bold">
              <i className="bi bi-mortarboard-fill me-2"></i> Étape 2/4
            </h3>
            <p className="text-muted small">Informations académiques et personnelles</p>
            <div className="progress" style={{ height: '8px' }}>
              <div className="progress-bar bg-primary" role="progressbar" style={{ width: '50%' }}></div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <h6 className="text-primary fw-bold mb-3"><i className="bi bi-geo-alt-fill me-2"></i>CHOIX DU PARCOURS</h6>
            <div className='row g-3 mb-4'>
              <div className="col-md-4">
                <label className="form-label fw-bold small">Département *</label>
                <select className="form-select" value={departement} onChange={e => setDepartement(e.target.value)} required>
                  <option value="">-- Choisir --</option>
                  {departements.map(d => <option key={d.id} value={d.id}>{d.nomDep}</option>)}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label fw-bold small">Filière *</label>
                <select className="form-select" value={filiere} onChange={e => setFiliere(e.target.value)} disabled={!departement} required>
                  <option value="">-- Choisir --</option>
                  {filieres.map(f => <option key={f.id} value={f.id}>{f.intitule}</option>)}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label fw-bold small">Spécialité *</label>
                <select className="form-select" value={specialiteId} onChange={e => setSpecialiteId(e.target.value)} disabled={!filiere} required>
                  <option value="">-- Choisir --</option>
                  {specialites.map(s => <option key={s.id} value={s.id}>{s.libelle}</option>)}
                </select>
              </div>
            </div>

            <h6 className="text-primary fw-bold mb-3"><i className="bi bi-person-lines-fill me-2"></i>ÉTAT CIVIL</h6>
            <div className='row g-3 mb-3'>
              <div className="col-md-6">
                <label className="form-label fw-bold small">Date de naissance *</label>
                <input type="date" className="form-control"
                 value={dateNaissance} onChange={e => setDateNaissance(e.target.value)}
                  required
                  min={'2004-01-01'}
                   max={'2010-12-31'}
                   />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold small">Lieu de naissance *</label>
                <input type="text" className="form-control" placeholder="Ex: Douala" value={lieuNaissance} onChange={e => setLieuNaissance(e.target.value)} required />
              </div>
            </div>

            <div className='row g-3 mb-4'>
              <div className="col-md-4">
                <label className="form-label fw-bold small">Sexe *</label>
                <select className="form-select" value={sexe} onChange={e => setSexe(e.target.value)} required>
                  <option value="">-- Choisir --</option>
                  {Object.values(Sexe).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label fw-bold small">Nationalité *</label>
                <input type="text" className="form-control" value={nationalite} onChange={e => setNationalite(e.target.value)} required />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-bold small">Ville de résidence *</label>
                <input type="text" className="form-control" value={ville} onChange={e => setVille(e.target.value)} required />
              </div>
            </div>

            <h6 className="text-secondary fw-bold mb-3"><i className="bi bi-people-fill me-2"></i>URGENCE / PARENTS</h6>
            <div className='row g-3 mb-4'>
              <div className="col-md-6">
                <input type="text" className="form-control mb-2" placeholder="Nom du père" value={nomPere} onChange={e => setNomPere(e.target.value)} />
                <input type="text" className="form-control" placeholder="Téléphone père" value={telephonePere} onChange={e => setTelephonePere(e.target.value)} />
              </div>
              <div className="col-md-6">
                <input type="text" className="form-control mb-2" placeholder="Nom de la mère" value={nomMere} onChange={e => setNomMere(e.target.value)} />
                <input type="text" className="form-control" placeholder="Téléphone mère" value={telephoneMere} onChange={e => setTelephoneMere(e.target.value)} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-100 btn-lg shadow-sm fw-bold" disabled={loading}>
              Continuer vers l'étape 3 <i className="bi bi-arrow-right ms-2"></i>
            </button>

            {error && (
              <div className="alert alert-danger mt-3 text-center small animate__animated animate__shakeX">
                <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
              </div>
            )}
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}