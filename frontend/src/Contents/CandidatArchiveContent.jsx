import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  BiSearch,
  BiDownload,
  BiFile,
  BiFilterAlt,
  BiLoaderAlt,
  BiArchive
} from 'react-icons/bi';
import { getMyArchivesBySpeciality, getAnnees } from '../services/archiveService';
import api from '../services/api';

const API_BASE_URL = process.env.REACT_APP_API_URL;
const colorGreen = "#25963F";
const colorBlue = "#1E90FF";

export default function CandidatArchiveContent() {
  const [archives, setArchives] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSession, setSelectedSession] = useState('');

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await getAnnees();
        const data = res.data?.data || res.data || [];
        setSessions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSessions();
  }, []);

  useEffect(() => {
    const fetchArchives = async () => {
      setLoading(true);
      try {
        const params = {
          anneeId: selectedSession || undefined,
          search: search || undefined
        };
        const res = await getMyArchivesBySpeciality(params);
        const data = res.data?.data || res.data || [];
        setArchives(Array.isArray(data) ? data : []);
      } catch (err) {
        toast.error("Erreur lors du chargement");
      } finally {
        setLoading(false);
      }
    };

    const delay = setTimeout(fetchArchives, 400);
    return () => clearTimeout(delay);
  }, [search, selectedSession]);

  const handleDownload = (fileUrl) => {
    if (!fileUrl) return;
    const filename = fileUrl.split('/').pop();
    window.open(`${API_BASE_URL}/archives/download/${filename}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* ================= HEADER ================= */}
      <div className="mb-12">
        <div className="flex items-center gap-4">
          
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800">
              Archives académiques
            </h1>
            <p className="text-gray-500">
              Ressources officielles par spécialité et session
            </p>
          </div>
        </div>
      </div>

      {/* ================= FILTRES ================= */}
      <div className="bg-white rounded-2xl p-6 shadow mb-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="fliter-search" style={{display:'flex',gap:'50px',padding:'10px'}}>
                  {/* Recherche */}
            <div className="relative md:col-span-2">
                <BiSearch
                    className="absolute left-4 top-1/2 -translate-y-1/2"
                    size={20}
                    color={colorBlue}
                />
                <input
                    type="text"
                    placeholder="Rechercher une épreuve"
                    className="w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 outline-none"
                    style={{ borderColor: colorBlue }}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div> 

                <div className="relative">
                <BiFilterAlt
                    className="absolute left-4 top-1/2 -translate-y-1/2"
                    size={20}
                    color={colorGreen}
                />
                <select
                    className="w-full pl-12 pr-4 py-3 border rounded-xl outline-none focus:ring-2"
                    style={{ borderColor: colorGreen }}
                    value={selectedSession}
                    onChange={(e) => setSelectedSession(e.target.value)}
                >
                    <option value="">Toutes les sessions</option>
                    {sessions.map((s) => (
                    <option key={s.id} value={s.id}>
                        {s.nom || s.libelle}
                    </option>
                    ))}
                </select>
                </div>

        </div>
       
   

        
      </div> <br />

      {/* ================= CONTENU ================= */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-28">
          <BiLoaderAlt
            className="animate-spin mb-4"
            size={42}
            color={colorBlue}
          />
          <p className="text-gray-400 font-medium">
            Chargement des archives…
          </p>
        </div>
      ) : archives.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {archives.map((archive, index) => (
            <div
              key={archive.id}
              className="bg-white rounded-2xl border shadow-sm hover:shadow-xl transition-all p-6 animate-card"
              style={{ animationDelay: `${index * 0.1}s`,padding:'20px' }}
            >
              {/* Card header */}
              <div className="flex justify-between mb-5">
                <div
                  className="p-3 rounded-xl text-white"
                  style={{ backgroundColor: colorGreen }}
                >
                  <BiFile size={26} />
                </div>

                <span
                  className="text-xs font-bold px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: `${colorBlue}20`,
                    color: colorBlue
                  }}
                >
                  {archive.annee?.libelle || 'N/A'}
                </span>
              </div>

              <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                {archive.epreuve?.nomEpreuve}
              </h3>

              <p className="text-sm text-gray-500 mb-6">
                {archive.epreuve?.specialite?.libelle || 'Matière générale'}
              </p>

              <button
                onClick={() => handleDownload(archive.fileUrl)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold transition active:scale-95"
                style={{ backgroundColor: colorBlue,borderRadius:'8px'}}
              >
                <BiDownload size={18} />
                Télécharger
              </button>
            </div> 
          ))}
        </div> 
      ) : (
        <div className="bg-white border-2 border-dashed rounded-2xl p-20 text-center">
          <BiArchive size={50} className="mx-auto mb-4 text-gray-300" />
          <h3 className="font-bold text-lg text-gray-700">
            Aucune archive trouvée
          </h3>
          <p className="text-gray-400">
            Ajustez vos filtres de recherche
          </p>
        </div>
      )}

      {/* ================= ANIMATION ================= */}
      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-card {
          animation: fadeUp 0.5s ease forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
