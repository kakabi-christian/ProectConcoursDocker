import React, { useEffect, useState, useCallback } from 'react';
import { Bell, CheckCircle, Info, AlertTriangle, XCircle, Trash2 } from 'lucide-react';
import NotificationService from '../services/NotificationService';
import { NotificationType } from '../models/Notification';
import { getUserProfile } from '../services/authService';

export default function NotificationContent() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));

  // Extraction de l'ID compatible avec le backend (userId pour Google, id pour classique)
  const userId = user?.userId || user?.id;

  // =========================================================
  // 1. SYNC DU PROFIL (Pour Google Auth)
  // =========================================================
  useEffect(() => {
    const syncProfile = async () => {
      const token = localStorage.getItem('access_token');
      if (token && !user?.userId) {
        try {
          console.log("📡 [NOTIFS] Sync du profil utilisateur...");
          const profile = await getUserProfile();
          localStorage.setItem('user', JSON.stringify(profile));
          setUser(profile);
        } catch (err) {
          console.error("❌ [NOTIFS] Erreur sync profil:", err);
        }
      }
    };
    syncProfile();
  }, [user?.userId]);

  // =========================================================
  // 2. CHARGEMENT DES NOTIFICATIONS
  // =========================================================
  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      console.log("⏳ [NOTIFS] En attente de l'ID utilisateur...");
      return;
    }

    try {
      setLoading(true);
      console.log("🏗️ [NOTIFS] Chargement des notifications pour:", userId);
      const response = await NotificationService.getByUserId(userId);
      
      // Adaptation selon la structure de ta réponse API
      const notifsData = response.data || response || [];
      setNotifications(notifsData);
      
      // Une fois affichées, on les marque comme lues
      if (notifsData.length > 0) {
        await NotificationService.markAllAsRead(userId);
        // On prévient la Sidebar/Navbar de remettre le compteur à 0
        window.dispatchEvent(new Event("notificationsRead"));
      }
    } catch (error) {
      console.error("❌ [NOTIFS] Erreur chargement:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // =========================================================
  // 3. UI HELPERS
  // =========================================================
  const getIcon = (type) => {
    switch (type) {
      case NotificationType.SUCCESS: return <CheckCircle className="text-success" size={24} />;
      case NotificationType.WARNING: return <AlertTriangle className="text-warning" size={24} />;
      case NotificationType.ERROR: return <XCircle className="text-danger" size={24} />;
      default: return <Info className="text-info" size={24} />;
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm("Voulez-vous supprimer tout votre historique de notifications ?")) return;
    
    try {
      await NotificationService.deleteAll(userId);
      setNotifications([]);
      console.log("✅ [NOTIFS] Historique supprimé");
    } catch (error) {
      alert("Erreur lors de la suppression.");
    }
  };

  return (
    <div className="container-fluid p-0 bg-light" style={{ minHeight: '100vh' }}>
      {/* HEADER */}
      <div className="bg-white p-3 shadow-sm sticky-top border-bottom">
        <div className="d-flex align-items-center justify-content-between">
          <h5 className="fw-bold mb-0 d-flex align-items-center">
            <Bell className="me-2 text-primary" size={20} />
            Notifications
          </h5>
          <span className="badge bg-primary-subtle text-primary rounded-pill px-3">
            {notifications.length} au total
          </span>
        </div>
      </div>

      {/* LISTE */}
      <div className="p-2">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-2 text-muted fw-medium">Mise à jour de vos alertes...</p>
          </div>
        ) : notifications.length > 0 ? (
          <div className="d-flex flex-column gap-2">
            {notifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`card border-0 shadow-sm rounded-4 overflow-hidden transition-all ${!notif.isRead ? 'border-start border-primary border-4' : ''}`}
              >
                <div className="card-body p-3">
                  <div className="d-flex align-items-start gap-3">
                    <div className="bg-light p-2 rounded-circle">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <span className="fw-bold small text-uppercase text-muted" style={{ fontSize: '0.7rem' }}>
                          {notif.type}
                        </span>
                        <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                          {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''}
                        </small>
                      </div>
                      <p className="mb-0 text-dark" style={{ fontSize: '0.95rem', lineHeight: '1.4' }}>
                        {notif.message}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ÉTAT VIDE */
          <div className="text-center py-5 px-4 mt-5">
            <div className="bg-white d-inline-block p-4 rounded-circle shadow-sm mb-3">
              <Bell size={48} className="text-muted opacity-25" />
            </div>
            <h5 className="fw-bold text-dark">Tout est à jour !</h5>
            <p className="text-muted small">Vous n'avez aucune nouvelle notification pour le moment.</p>
          </div>
        )}
      </div>

      {/* BOUTON SUPPRIMER TOUT */}
      {notifications.length > 0 && (
        <div className="p-4 text-center">
          <button 
            className="btn btn-sm btn-outline-secondary rounded-pill px-4 border-0"
            onClick={handleDeleteAll}
          >
            <Trash2 size={14} className="me-1" /> Effacer l'historique
          </button>
        </div>
      )}
    </div>
  );
}