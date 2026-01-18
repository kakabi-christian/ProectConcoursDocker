import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, User, Settings, Bell } from 'lucide-react';
import { BiLogOut } from 'react-icons/bi';
import NotificationService from '../services/NotificationService';

const colorGreen = '#25963F';
const colorBlue = '#1E90FF';

export default function SideBarCandidat() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Récupération de l'utilisateur stocké lors du login
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  const fetchUnreadCount = async () => {
    if (user?.id) {
      try {
        const response = await NotificationService.getUnreadCount(user.id);
        // On s'adapte à la structure de UnreadCountResponse { unreadCount: number }
        setUnreadCount(response.unreadCount);
      } catch (error) {
        console.error("Erreur compteur notifications", error);
      }
    }
  };

  useEffect(() => {
    fetchUnreadCount();

    // Écouteur pour remettre à zéro quand l'utilisateur "entre" dans la page notifications
    const handleReset = () => setUnreadCount(0);
    window.addEventListener("notificationsRead", handleReset);

    // Rafraîchir toutes les 2 minutes pour voir s'il y a du nouveau
    const interval = setInterval(fetchUnreadCount, 120000);

    return () => {
      window.removeEventListener("notificationsRead", handleReset);
      clearInterval(interval);
    };
  }, [user?.id]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setShowModal(false);
    navigate("/Login");
  };

  return (
    <div className="d-flex flex-column flex-shrink-0 text-white shadow-lg" 
         style={{ 
           width: '280px', 
           minHeight: '100vh', 
           backgroundColor: '#1a1a1a', 
           borderRight: `1px solid ${colorBlue}30` 
         }}>
      
      {/* 1. LOGO SECTION */}
      <div className="p-4 mb-2">
        <div className="d-flex flex-column align-items-center text-center">
          <div className="rounded-circle mb-3 d-flex align-items-center justify-content-center shadow-sm"
               style={{ width: '60px', height: '60px', backgroundColor: colorBlue }}>
            <span className="fs-3 fw-bold text-white">P</span>
          </div>
          <span className="fs-5 fw-bold text-uppercase tracking-wider" style={{ letterSpacing: '1px' }}>
            Polytech <span style={{ color: colorBlue }}>Maroua</span>
          </span>
          <div className="mt-1" style={{ width: '40px', height: '3px', backgroundColor: colorGreen, borderRadius: '2px' }}></div>
        </div>
      </div>

      <hr className="mx-4 opacity-25" />

      {/* 2. MENU NAVIGATION */}
      <nav className="nav nav-pills flex-column mb-auto px-3 mt-3">
        <SidebarLink to="/candidat/home" icon={<LayoutDashboard size={20} />} label="Tableau de bord" />
        <SidebarLink to="/candidat/archives" icon={<Settings size={20} />} label="Archives" />
        <SidebarLink to="/candidat/feeback" icon={<Settings size={20} />} label="FeedBack" />   
        
        {/* LIEN NOTIFICATIONS AVEC BADGE */}
        <li className="nav-item mb-2">
          <NavLink 
            to="/candidat/notifications" 
            className={({ isActive }) => 
              `nav-link d-flex align-items-center justify-content-between py-3 px-3 transition-all rounded-3 ${
                isActive ? "active text-white shadow-sm" : "text-white-50"
              }`
            }
            style={({ isActive }) => ({
              backgroundColor: isActive ? colorBlue : 'transparent',
            })}
          >
            <div className="d-flex align-items-center">
              <Bell size={20} className="me-3" />
              <span className="fw-medium">Notifications</span>
            </div>
            
            {unreadCount > 0 && (
              <span className="badge rounded-pill bg-danger shadow-sm animate-bounce" 
                    style={{ fontSize: '0.75rem', padding: '0.4em 0.65em' }}>
                {unreadCount}
              </span>
            )}
          </NavLink>
        </li>

        <SidebarLink to="/candidat/dossier" icon={<User size={20} />} label="Profil" />
        <SidebarLink to="/candidat/dossier-upload" icon={<User size={20} />} label="Dossier" />
      </nav>

      {/* 3. FOOTER & DECONNEXION */}
      <div className="p-4 mt-auto border-top border-secondary border-opacity-25 bg-dark">
        <button 
          className="btn btn-outline-danger w-100 fw-bold d-flex align-items-center justify-content-center shadow-sm" 
          style={{ borderRadius: "10px", padding: "10px", borderWidth: '2px' }}
          onClick={() => setShowModal(true)}
        >
          <BiLogOut className="me-2" size={22} /> 
          <span>Déconnexion</span>
        </button>
      </div>

      {/* MODAL DE DECONNEXION */}
      {showModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 2000 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow">
              <div className="modal-body p-5 text-center text-dark">
                <div className="text-danger mb-4">
                  <BiLogOut size={60} />
                </div>
                <h3 className="fw-bold mb-3">Déconnexion</h3>
                <p className="text-muted mb-4">Êtes-vous sûr de vouloir quitter votre session ?</p>
                <div className="d-flex gap-3">
                  <button className="btn btn-light w-100 fw-bold py-2 rounded-pill" onClick={() => setShowModal(false)}>
                    Annuler
                  </button>
                  <button className="btn btn-danger w-100 fw-bold py-2 rounded-pill shadow-sm" onClick={handleLogout}>
                    Oui, me déconnecter
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SidebarLink({ to, icon, label }) {
  return (
    <li className="nav-item mb-2">
      <NavLink 
        to={to} 
        className={({ isActive }) => 
          `nav-link d-flex align-items-center py-3 px-3 transition-all rounded-3 ${
            isActive ? "active text-white shadow-sm" : "text-white-50"
          }`
        }
        style={({ isActive }) => ({
          backgroundColor: isActive ? colorBlue : 'transparent',
        })}
      >
        <div className="me-3">{icon}</div>
        <span className="fw-medium">{label}</span>
      </NavLink>
    </li>
  );
}