import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, loginWithGoogle, loginWithGithub } from "../services/authService"; 

export default function LoginContent() {
  const [codeAdmin, setCodeAdmin] = useState("");
  const [password, setPassword] = useState("");
  const [numeroRecu, setNumeroRecu] = useState("");
  const [userType, setUserType] = useState("CANDIDATE");
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleGoogleLogin = () => loginWithGoogle();
  const handleGithubLogin = () => loginWithGithub();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setInfoMessage("");
    setLoading(true);

    try {
      let payload = { userType, password };

      if (userType === "ADMIN" || userType === "SUPERADMIN") {
        payload.codeAdmin = codeAdmin;
      } else if (userType === "CANDIDATE") {
        payload.numeroRecu = numeroRecu;
      }

      const data = await loginUser(payload);

      if (data.access_token) {
        // 1. Stockage du Token
        localStorage.setItem("access_token", data.access_token);
        
        // 2. Stockage des infos utilisateurs générales
        localStorage.setItem("user", JSON.stringify(data.user));

        // 🎯 LOGIQUE CRITIQUE POUR LE CHAT (ADMIN)
        // On vérifie si c'est un admin et on récupère l'ID de la table Admin
        if (data.user?.admin) {
          const adminId = data.user.admin.id;
          localStorage.setItem("adminId", adminId);
          console.log("ID Admin enregistré pour le chat:", adminId);
        }

        // 🎯 LOGIQUE POUR LE CANDIDAT
        if (data.user?.candidateId) {
          localStorage.setItem("candidateId", data.user.candidateId);
        }
      }

      const role = data.user.userType;

      if (role === "ADMIN" || role === "SUPERADMIN") {
        navigate("/admin/statistiques");
      } else if (role === "CANDIDATE") {
        const step = data.registrationStep;

        if (step === 0) {
          navigate("/candidat/home");
        } else {
          setInfoMessage(
            `Inscription incomplète. Redirection vers l'étape ${step} dans 3 secondes...`
          );

          const stepRoutes = {
            2: "/Step2Register",
            3: "/Step3Register",
            4: "/Step4Register",
          };

          setTimeout(() => {
            navigate(stepRoutes[step] || "/Step2Register");
          }, 3000);
        }
      }
    } catch (err) {
      console.error("Erreur Login:", err);
      setError(err.message || "Identifiants invalides ou accès refusé.");
      setLoading(false);
    }
  };

  return (
    <div
      className="container d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}
    >
      <div
        className="card p-5 shadow-lg border-0"
        style={{ width: "100%", maxWidth: "450px" }}
      >
        <h2 className="card-title text-center mb-4 text-primary fw-bold">
          <i className="bi bi-person-circle me-2"></i> Connexion
        </h2>

        {error && (
          <div className="alert alert-danger text-center mb-3" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        )}

        {infoMessage && (
          <div className="alert alert-info text-center mb-3" role="alert">
            <div className="spinner-border spinner-border-sm me-2" role="status"></div>
            {infoMessage}
          </div>
        )}

        {userType === "CANDIDATE" && (
          <>
            <div className="d-grid gap-2 mb-3">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="btn btn-outline-dark d-flex align-items-center justify-content-center py-2 fw-bold"
                disabled={loading}
              >
                <img
                  src="https://developers.google.com/identity/images/g-logo.png"
                  alt="Google"
                  width="20"
                  height="20"
                  className="me-2"
                />
                Google
              </button>

              <button
                type="button"
                onClick={handleGithubLogin}
                className="btn btn-dark d-flex align-items-center justify-content-center py-2 fw-bold"
                disabled={loading}
              >
                <i className="bi bi-github me-2 fs-5"></i>
                GitHub
              </button>
            </div>

            <div className="d-flex align-items-center my-3">
              <hr className="flex-grow-1" />
              <span className="mx-2 text-muted small">OU</span>
              <hr className="flex-grow-1" />
            </div>
          </>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label fw-medium">
              <i className="bi bi-person-badge-fill me-2"></i> Rôle
            </label>
            <select
              className="form-select"
              value={userType}
              onChange={(e) => {
                setUserType(e.target.value);
                setError("");
                setInfoMessage("");
              }}
              disabled={loading}
            >
              <option value="CANDIDATE">Candidat</option>
              <option value="ADMIN">Administrateur</option>
            </select>
          </div>

          {(userType === "ADMIN" || userType === "SUPERADMIN") && (
            <div className="mb-3">
              <label className="form-label fw-medium">Code Admin</label>
              <input
                type="text"
                className="form-control"
                value={codeAdmin}
                onChange={(e) => setCodeAdmin(e.target.value)}
                placeholder="Ex: ADMIN-2025-XXXX"
                required
                disabled={loading}
              />
            </div>
          )}

          {userType === "CANDIDATE" && (
            <div className="mb-3">
              <label className="form-label fw-medium">Numéro de reçu</label>
              <input
                type="text"
                className="form-control"
                value={numeroRecu}
                onChange={(e) => setNumeroRecu(e.target.value)}
                placeholder="Numéro de reçu"
                required
                disabled={loading}
              />
            </div>
          )}

          <div className="mb-4">
            <label className="form-label fw-medium">Mot de passe</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 btn-lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Chargement...
              </>
            ) : (
              "Se connecter"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}