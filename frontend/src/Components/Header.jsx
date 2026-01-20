import React from 'react';
import { Link, useLocation } from "react-router-dom";
import '../Styles/Header.css';
import logo from '../Assets/logo-sgee.png';

const colorGreen = '#25963F';
const colorBlue = '#1E90FF';

export default function Header() {

  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="Container">

      {/* Header bleu */}
      <div className="Blue" style={{ height: '25px', backgroundColor: colorBlue }}></div>

      {/* NAVBAR BOOTSTRAP */}
      <nav className="navbar navbar-expand-lg bg-white shadow-sm py-2">

        <div className="container">

          {/* Logo */}
          <div className="d-flex align-items-center gap-2">
            <img src={logo} alt="logo-app" className="logo-img" style={{ height: '70px',width: '70px' }} />
            {/* <p className="fw-bold mb-0" style={{ color: colorGreen, fontSize: '18px' }}>SGEE</p> */}
          </div>

          {/* Button Burger Mobile */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Links */}
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav mx-auto d-flex gap-3">

              {/* ACCUEIL */}
              <li className="nav-item">
                <Link
                  className={`nav-link fw-bold d-flex align-items-center gap-2 ${isActive("/") ? "active-link" : ""}`}
                  style={{ color: isActive("/") ? colorGreen : '#555' }}
                  to="/"
                >
                  <i className="fas fa-home"></i>
                  Accueil
                </Link>
              </li>

              {/* SITES */}
              <li className="nav-item">
                <Link
                  className={`nav-link fw-bold d-flex align-items-center gap-2 ${isActive("/Site") ? "active-link" : ""}`}
                  style={{ color: isActive("/Site") ? colorGreen : '#555' }}
                  to="/Site"
                >
                  <i className="fas fa-map-marker-alt"></i>
                  Nos sites
                </Link>
              </li>

              {/* ARCHIVES */}
              <li className="nav-item">
                <Link
                  className={`nav-link fw-bold d-flex align-items-center gap-2 ${isActive("/Archives") ? "active-link" : ""}`}
                  style={{ color: isActive("/Archives") ? colorGreen : '#555' }}
                  to="/Archives"
                >
                  <i className="fas fa-file-archive"></i>
                  Nos archives
                </Link>
              </li>

              {/* PAIEMENT */}
              <li className="nav-item">
                <Link
                  className={`nav-link fw-bold d-flex align-items-center gap-2 ${isActive("/Paiement") ? "active-link" : ""}`}
                  style={{ color: isActive("/Paiement") ? colorGreen : '#555' }}
                  to="/Paiement"
                >
                  <i className="fas fa-credit-card"></i>
                  Paiement
                </Link>
              </li>
            </ul>

            {/* Login + Register */}
            <div className="d-flex gap-3 mt-lg-0 mt-3">

              <Link
                className="btn fw-bold d-flex align-items-center gap-2"
                style={{
                  backgroundColor: colorBlue,
                  color: "white",
                  borderRadius: "8px",
                }}
                to="/Login"
              >
                <i className="fas fa-sign-in-alt"></i>
                Connexion
              </Link>

              <Link
                className="btn fw-bold d-flex align-items-center gap-2"
                style={{
                  backgroundColor: colorBlue,
                  color: "white",
                  borderRadius: "8px",
                }}
                to="/Register"
              >
                <i className="fas fa-user-plus"></i>
                Inscription
              </Link>

            </div>

          </div>
        </div>
      </nav>

    </div>
  );
}