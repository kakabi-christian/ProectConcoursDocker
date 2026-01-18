import React, { useState, useEffect } from 'react';
import {
  getAnnees,
  getDepartements,
  getFilieresByDepartement,
  getEpreuvesBySpecialite,
  getArchivesByEpreuve,
} from '../services/archiveService';

export default function ArchiveContent() {
  const [annees, setAnnees] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [filieres, setFilieres] = useState([]);
  const [specialites, setSpecialites] = useState([]);
  const [epreuves, setEpreuves] = useState([]);
  const [archives, setArchives] = useState([]);

  const [selectedAnnee, setSelectedAnnee] = useState('');
  const [selectedDepartement, setSelectedDepartement] = useState('');
  const [selectedFiliere, setSelectedFiliere] = useState('');
  const [selectedSpecialite, setSelectedSpecialite] = useState('');
  const [selectedEpreuve, setSelectedEpreuve] = useState('');

  const API_BASE_URL = 'http://localhost:3000';

  // 1. Charger les années et départements
  useEffect(() => {
    getAnnees()
      .then(res => {
        // CORRECTION ICI : NestJS renvoie { data: [], pagination: {} }
        // On vérifie si res.data.data existe, sinon on prend res.data
        const dataArray = res.data && res.data.data ? res.data.data : res.data;
        setAnnees(Array.isArray(dataArray) ? dataArray : []);
      })
      .catch(err => console.error("Erreur années:", err));

    getDepartements()
      .then(res => {
        const dataArray = res.data && res.data.data ? res.data.data : res.data;
        setDepartements(Array.isArray(dataArray) ? dataArray : []);
      })
      .catch(err => console.error("Erreur départements:", err));
  }, []);

  // 2. Charger les filières quand le département change
  useEffect(() => {
    if (selectedDepartement) {
      getFilieresByDepartement(selectedDepartement).then(res => {
        const dataArray = res.data && res.data.data ? res.data.data : res.data;
        setFilieres(Array.isArray(dataArray) ? dataArray : []);
      });
      setSpecialites([]);
      setEpreuves([]);
      setArchives([]);
      setSelectedFiliere('');
      setSelectedSpecialite('');
      setSelectedEpreuve('');
    } else {
      setFilieres([]);
    }
  }, [selectedDepartement]);

  // 3. Charger les spécialités quand la filière change
  useEffect(() => {
    if (selectedFiliere) {
      const filiere = filieres.find(f => f.id === selectedFiliere);
      setSpecialites(filiere?.specialites || []);
      setEpreuves([]);
      setArchives([]);
      setSelectedSpecialite('');
      setSelectedEpreuve('');
    } else {
      setSpecialites([]);
    }
  }, [selectedFiliere, filieres]);

  // 4. Charger les épreuves quand la spécialité change
  useEffect(() => {
    if (selectedSpecialite) {
      getEpreuvesBySpecialite(selectedSpecialite).then(res => {
        const dataArray = res.data && res.data.data ? res.data.data : res.data;
        setEpreuves(Array.isArray(dataArray) ? dataArray : []);
      });
      setArchives([]);
      setSelectedEpreuve('');
    } else {
      setEpreuves([]);
    }
  }, [selectedSpecialite]);

  // 5. Charger les archives quand l'épreuve change
  useEffect(() => {
    if (selectedEpreuve) {
      getArchivesByEpreuve(selectedEpreuve).then(res => {
        const rawData = res.data && res.data.data ? res.data.data : res.data;
        if (Array.isArray(rawData)) {
          const dataWithFullUrl = rawData.map(a => ({
            ...a,
            fileUrl: a.fileUrl?.startsWith('http') ? a.fileUrl : `${API_BASE_URL}${a.fileUrl}`,
          }));
          setArchives(dataWithFullUrl);
        } else {
          setArchives([]);
        }
      });
    } else {
      setArchives([]);
    }
  }, [selectedEpreuve]);

  return (
    <div className="container mt-5 mb-5">
      <div className="card p-4 shadow">
        <h2 className="text-center mb-4">Archives des épreuves</h2>

        {/* Sélecteur Année */}
        <div className="mb-3">
          <label className="form-label fw-bold">Année :</label>
          <select className="form-select" value={selectedAnnee} onChange={e => setSelectedAnnee(e.target.value)}>
            <option value="">-- Sélectionner une année --</option>
            {Array.isArray(annees) && annees.map(a => (
              <option key={a.id} value={a.id}>{a.libelle}</option>
            ))}
          </select>
          {(!annees || annees.length === 0) && <small className="text-muted">Aucune année disponible.</small>}
        </div>

        {/* Sélecteur Département */}
        <div className="mb-3">
          <label className="form-label fw-bold">Département :</label>
          <select className="form-select" value={selectedDepartement} onChange={e => setSelectedDepartement(e.target.value)}>
            <option value="">-- Sélectionner un département --</option>
            {Array.isArray(departements) && departements.map(d => (
              <option key={d.id} value={d.id}>{d.nomDep}</option>
            ))}
          </select>
        </div>

        {/* Sélecteur Filière */}
        {filieres.length > 0 && (
          <div className="mb-3">
            <label className="form-label fw-bold">Filière :</label>
            <select className="form-select" value={selectedFiliere} onChange={e => setSelectedFiliere(e.target.value)}>
              <option value="">-- Sélectionner une filière --</option>
              {filieres.map(f => <option key={f.id} value={f.id}>{f.intitule}</option>)}
            </select>
          </div>
        )}

        {/* Sélecteur Spécialité */}
        {specialites.length > 0 && (
          <div className="mb-3">
            <label className="form-label fw-bold">Spécialité :</label>
            <select className="form-select" value={selectedSpecialite} onChange={e => setSelectedSpecialite(e.target.value)}>
              <option value="">-- Sélectionner une spécialité --</option>
              {specialites.map(s => <option key={s.id} value={s.id}>{s.libelle}</option>)}
            </select>
          </div>
        )}

        {/* Sélecteur Épreuve */}
        {epreuves.length > 0 && (
          <div className="mb-3">
            <label className="form-label fw-bold">Épreuve :</label>
            <select className="form-select" value={selectedEpreuve} onChange={e => setSelectedEpreuve(e.target.value)}>
              <option value="">-- Sélectionner une épreuve --</option>
              {epreuves.map(ep => <option key={ep.id} value={ep.id}>{ep.nomEpreuve}</option>)}
            </select>
          </div>
        )}

        {/* Liste des Archives */}
        {archives.length > 0 ? (
          <div className="mt-4">
            <h4 className="border-bottom pb-2">Archives disponibles :</h4>
            <ul className="list-group">
              {archives.map(a => (
                <li key={a.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    {a.fileUrl?.toLowerCase().endsWith('.pdf') ? (
                      <a href={a.fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline-danger btn-sm">
                        <i className="bi bi-file-pdf"></i> Voir le PDF
                      </a>
                    ) : (
                      <div className="text-center">
                        <img
                          src={a.fileUrl}
                          alt="Archive"
                          className="img-fluid rounded shadow-sm my-2"
                          style={{ maxHeight: '300px' }}
                          onError={e => { e.target.style.display = 'none'; }}
                        />
                      </div>
                    )}
                  </div>
                  <small className="text-muted">ID: {a.id}</small>
                </li>
              ))}
            </ul>
          </div>
        ) : selectedEpreuve ? (
          <div className="alert alert-info mt-4">Aucune archive disponible pour cette épreuve.</div>
        ) : null}
      </div>
    </div>
  );
}