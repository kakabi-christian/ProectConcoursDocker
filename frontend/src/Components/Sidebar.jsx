import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import DossierService from "../services/DossierService";
import ChatService from "../services/ChatService"; // Import du nouveau service
import { FaBuilding, FaDoorOpen, FaWallet } from "react-icons/fa";

import {
  BiBarChart,
  BiLogOut,
  BiStats,
  BiBuildings,
  BiCalendar,
  BiLayer,
  BiArchive,
  BiTask,
  BiChevronDown,
  BiShieldQuarter,
  BiUserCircle,
  BiFile,
  BiFolderOpen,
  BiCog,
  BiMessageDetail,
  BiWallet,
} from "react-icons/bi";
import { AiOutlinePieChart, AiOutlineDashboard } from "react-icons/ai";
import {
  FaUserFriends,
  FaUniversity,
  FaSchool,
  FaBook,
  FaListUl,
  FaUserShield,
  FaUserCog,
} from "react-icons/fa";
import { MdOutlineClass, MdHistoryEdu } from "react-icons/md";
import { RiListSettingsFill } from "react-icons/ri";

export default function Sidebar() {
  const [showModal, setShowModal] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0); // Nouvel état pour les messages
  const navigate = useNavigate();

  const [openGroups, setOpenGroups] = useState({
    gestion: true,
    structure: false,
    organisation: false,
    cadre: false,
    securite: false,
    dossiers: false,
    analyse: false,
    finance: false,
  });

  // --- EFFET DE CHARGEMENT DES COMPTEURS ---
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // 1. Récupérer les dossiers en attente
        const dossierData = await DossierService.getPendingCount();
        setPendingCount(dossierData.pendingCount);

        // 2. Récupérer les messages non lus
        const chatUnread = await ChatService.getUnreadMessagesCount();
        setUnreadMessagesCount(chatUnread);
      } catch (error) {
        console.error("[Sidebar] Erreur lors de la mise à jour des compteurs:", error);
      }
    };

    fetchCounts();

    // Écouter les événements personnalisés si tu en as
    window.addEventListener("dossierStatusUpdated", fetchCounts);
    window.addEventListener("messageReceived", fetchCounts); // Optionnel : si ton chat emet cet event

    // Rafraîchissement automatique toutes les minutes
    const interval = setInterval(fetchCounts, 60000);

    return () => {
      clearInterval(interval);
      window.removeEventListener("dossierStatusUpdated", fetchCounts);
      window.removeEventListener("messageReceived", fetchCounts);
    };
  }, []);

  const toggleGroup = (group) => {
    setOpenGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  const handleLogout = () => {
    setShowModal(false);
    localStorage.removeItem("access_token");
    navigate("/Login");
  };

  const linkStyle = ({ isActive }) => ({
    textDecoration: "none",
    borderRadius: "10px",
    margin: "4px 0",
    padding: "10px 15px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    backgroundColor: isActive ? "#eef4ff" : "transparent",
    color: isActive ? "#0d6efd" : "#6c757d",
    fontWeight: isActive ? "600" : "500",
    borderLeft: isActive ? "4px solid #0d6efd" : "4px solid transparent",
    transform: isActive ? "translateX(5px)" : "translateX(0)",
  });

  const GroupHeader = ({ title, groupId, isOpen, icon: Icon }) => (
    <div
      onClick={() => toggleGroup(groupId)}
      className="d-flex justify-content-between align-items-center mt-3 px-2 py-2 rounded shadow-sm"
      style={{
        cursor: "pointer",
        background: isOpen ? "#f1f3f5" : "#f8f9fa",
        transition: "background 0.3s ease",
      }}
    >
      <div className="d-flex align-items-center">
        <div className="bg-white p-1 rounded me-2 shadow-sm">
          <Icon size={16} className="text-primary" />
        </div>
        <span className="text-uppercase fw-bold" style={{ fontSize: "0.72rem", letterSpacing: "0.5px" }}>
          {title}
        </span>
      </div>
      <BiChevronDown
        size={18}
        style={{
          transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)",
          transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      />
    </div>
  );

  const AnimatedGroup = ({ isOpen, children }) => (
    <div style={{
      display: "grid",
      gridTemplateRows: isOpen ? "1fr" : "0fr",
      transition: "grid-template-rows 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease",
      opacity: isOpen ? 1 : 0,
      overflow: "hidden",
    }}>
      <div style={{ minHeight: 0 }}>
        <div className="ps-2 pt-1 pb-1">{children}</div>
      </div>
    </div>
  );

  return (
    <>
      <div className="sidebar bg-white border-end d-flex flex-column shadow-sm" style={{ width: "270px", height: "100vh", position: "sticky", top: 0 }}>
        <div className="p-4">
          <div className="bg-primary text-white p-3 rounded-4 d-flex align-items-center shadow-lg">
            <AiOutlineDashboard size={24} className="me-2" />
            <h4 className="fw-bold mb-0" style={{ fontSize: "1.2rem" }}>E-Concours</h4>
          </div>
        </div>

        <div className="flex-grow-1 px-3" style={{ overflowY: "auto", scrollbarWidth: "none" }}>
          <ul className="nav flex-column">
            
            {/* 1. GESTION DES FLUX */}
            <GroupHeader title="Gestion des flux" groupId="gestion" isOpen={openGroups.gestion} icon={BiTask} />
            <AnimatedGroup isOpen={openGroups.gestion}>
              <NavLink to="/admin/candidats" style={linkStyle}>
                <span><FaUserFriends className="me-3" /> Candidats</span>
              </NavLink>
              <NavLink to="/admin/concours" style={linkStyle}>
                <span><BiTask className="me-3" /> Concours</span>
              </NavLink>
              
              {/* MODIFICATION ICI : Ajout du Badge Messages */}
              <NavLink to="/admin/message" style={linkStyle}>
                <div className="d-flex align-items-center">
                  <BiMessageDetail className="me-3" /> 
                  Messages
                </div>
                {unreadMessagesCount > 0 && (
                  <span className="badge rounded-pill bg-primary animate-pulse" style={{ fontSize: "0.65rem", padding: "5px 8px" }}>
                    {unreadMessagesCount > 99 ? "99+" : unreadMessagesCount}
                  </span>
                )}
              </NavLink>

              <NavLink to="/admin/archive" style={linkStyle}>
                <span><BiArchive className="me-3" /> Archives</span>
              </NavLink>
            </AnimatedGroup>

            {/* 2. PARAMÉTRAGE DOSSIERS */}
            <GroupHeader title="Paramétrage Dossiers" groupId="dossiers" isOpen={openGroups.dossiers} icon={BiCog} />
            <AnimatedGroup isOpen={openGroups.dossiers}>
              <NavLink to="/admin/piece-dossier" style={linkStyle}>
                <span><BiFile className="me-3" /> Types de pièces</span>
              </NavLink>
              <NavLink to="/admin/dossier" style={linkStyle}>
                <div className="d-flex align-items-center"><BiFolderOpen className="me-3" /> Validation Dossiers</div>
                {pendingCount > 0 && (
                  <span className="badge rounded-pill bg-danger animate-pulse" style={{ fontSize: "0.65rem", padding: "5px 8px" }}>
                    {pendingCount}
                  </span>
                )}
              </NavLink>
            </AnimatedGroup>

            {/* 3. FINANCE & PAIEMENTS */}
            <GroupHeader title="Finance" groupId="finance" isOpen={openGroups.finance} icon={BiWallet} />
            <AnimatedGroup isOpen={openGroups.finance}>
              <NavLink to="/admin/retrait" style={linkStyle}>
                <span><BiWallet className="me-3" /> Retraits (Campay)</span>
              </NavLink>
            </AnimatedGroup>

            {/* ... Reste des groupes (Structure, Calendrier, Logistique, Sécurité, Analyse) ... */}
            {/* 4. STRUCTURE ACADÉMIQUE */}
            <GroupHeader title="Structure académique" groupId="structure" isOpen={openGroups.structure} icon={BiBuildings} />
            <AnimatedGroup isOpen={openGroups.structure}>
              <NavLink to="/admin/departements" style={linkStyle}><span><BiBuildings className="me-3" /> Départements</span></NavLink>
              <NavLink to="/admin/filieres" style={linkStyle}><span><FaBook className="me-3" /> Filières</span></NavLink>
              <NavLink to="/admin/specialites" style={linkStyle}><span><RiListSettingsFill className="me-3" /> Spécialités</span></NavLink>
              <NavLink to="/admin/batiment" style={linkStyle}><span><FaBuilding className="me-3" /> Bâtiments</span></NavLink>
              <NavLink to="/admin/salle" style={linkStyle}><span><FaDoorOpen className="me-3" /> Salles</span></NavLink>
            </AnimatedGroup>

            <GroupHeader title="Calendrier & Épreuves" groupId="cadre" isOpen={openGroups.cadre} icon={BiCalendar} />
            <AnimatedGroup isOpen={openGroups.cadre}>
              <NavLink to="/admin/annees" style={linkStyle}><span><BiCalendar className="me-3" /> Années académiques</span></NavLink>
              <NavLink to="/admin/sessions" style={linkStyle}><span><MdHistoryEdu className="me-3" /> Sessions</span></NavLink>
              <NavLink to="/admin/epreuves" style={linkStyle}><span><MdOutlineClass className="me-3" /> Épreuves</span></NavLink>
              <NavLink to="/admin/niveaux" style={linkStyle}><span><BiLayer className="me-3" /> Niveaux</span></NavLink>
            </AnimatedGroup>

            <GroupHeader title="Centres & Logistique" groupId="organisation" isOpen={openGroups.organisation} icon={FaUniversity} />
            <AnimatedGroup isOpen={openGroups.organisation}>
              <NavLink to="/admin/centre-depot" style={linkStyle}><span><FaUniversity className="me-3" /> Centres de dépôt</span></NavLink>
              <NavLink to="/admin/centre-examen" style={linkStyle}><span><FaSchool className="me-3" /> Centres d’examen</span></NavLink>
            </AnimatedGroup>

            <GroupHeader title="Sécurité & Accès" groupId="securite" isOpen={openGroups.securite} icon={BiShieldQuarter} />
            <AnimatedGroup isOpen={openGroups.securite}>
              <NavLink to="/admin/admin" style={linkStyle}><span><FaUserShield className="me-3" /> Administrateurs</span></NavLink>
              <NavLink to="/admin/roles" style={linkStyle}><span><FaUserCog className="me-3" /> Rôles & Permissions</span></NavLink>
            </AnimatedGroup>

            <GroupHeader title="Analyses & rapports" groupId="analyse" isOpen={openGroups.analyse} icon={BiStats} />
            <AnimatedGroup isOpen={openGroups.analyse}>
              <NavLink to="/admin/statistiques" style={linkStyle}><span><BiStats className="me-3" /> Statistiques</span></NavLink>
              <NavLink to="/admin/rapport" style={linkStyle}><span><BiBarChart className="me-3" /> Rapports</span></NavLink>
              <NavLink to="/admin/graphiques" style={linkStyle}><span><AiOutlinePieChart className="me-3" /> Graphiques</span></NavLink>
            </AnimatedGroup>

            <div className="mt-4 pt-3 border-top">
              <NavLink to="/admin/profile" style={linkStyle}>
                <div className="d-flex align-items-center">
                  <BiUserCircle size={20} className="me-3 text-secondary" />
                  <span className="text-secondary">Mon Profil</span>
                </div>
              </NavLink>
            </div>
          </ul>
        </div>

        {/* LOGOUT */}
        <div className="p-4 border-top bg-light">
          <button
            className="btn btn-outline-danger w-100 fw-bold d-flex align-items-center justify-content-center shadow-sm"
            style={{ borderRadius: "12px", transition: "all 0.3s", padding: "10px" }}
            onClick={() => setShowModal(true)}
          >
            <BiLogOut className="me-2" size={20} /> Déconnexion
          </button>
        </div>
      </div>

      {/* MODALE DE CONFIRMATION (Inchangée) */}
      {showModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(15, 23, 42, 0.5)", backdropFilter: "blur(6px)", zIndex: 1100 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "20px" }}>
              <div className="modal-body p-5 text-center">
                <div className="text-danger mb-4">
                  <div className="bg-danger bg-opacity-10 d-inline-block p-3 rounded-circle">
                    <BiLogOut size={40} />
                  </div>
                </div>
                <h4 className="fw-bold text-dark">Déconnexion</h4>
                <p className="text-muted">Souhaitez-vous vraiment quitter votre session ?</p>
                <div className="d-flex gap-3 mt-4">
                  <button className="btn btn-light w-100 fw-bold py-2" onClick={() => setShowModal(false)} style={{ borderRadius: "10px" }}>Rester</button>
                  <button className="btn btn-danger w-100 fw-bold py-2 shadow-sm" onClick={handleLogout} style={{ borderRadius: "10px" }}>Quitter</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}