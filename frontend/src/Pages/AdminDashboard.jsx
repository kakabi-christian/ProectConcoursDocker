// src/Pages/AdminDashboard.jsx
import React from 'react';
import { Outlet } from 'react-router-dom'; // Pour afficher le contenu des routes enfants
import Sidebar from '../Components/Sidebar';

export default function AdminDashboard() {
  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Contenu principal */}
      <div className="flex-grow-1 p-4" style={{ backgroundColor: '#f8f9fa' }}>
        <Outlet />
      </div>
    </div>
  );
}
