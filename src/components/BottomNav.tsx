// src/components/BottomNav.tsx
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./BottomNav.css";

type ActiveTab = "history" | "dashboard" | "register" | "companies" | "audits";
type RegisterType = "computers" | "medical" | null;

function getActiveFromPath(path: string): ActiveTab {
  if (path.startsWith("/devices/entered")) return "history";
  if (path.startsWith("/computers/checkin")) return "register";
  if (path.startsWith("/medical/checkin")) return "register";
  if (path.startsWith("/computers/frequent")) return "dashboard";
  if (path.startsWith("/companies")) return "companies";

  // Auditorías de usuario
  if (path.startsWith("/audit")) return "audits";

  // Rutas "profundas" (detalle, auditorías de equipo) las marcamos como history
  if (path.startsWith("/devices/")) return "history";
  if (path.startsWith("/equipment/")) return "history";

  return "history";
}

function getRegisterTypeFromPath(path: string): RegisterType {
  if (path.startsWith("/computers/checkin")) return "computers";
  if (path.startsWith("/medical/checkin")) return "medical";
  return null;
}

export default function BottomNav() {
  const [showRegisterMenu, setShowRegisterMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const active = getActiveFromPath(location.pathname);
  const registerActive = getRegisterTypeFromPath(location.pathname);

  function toggleRegisterMenu() {
    setShowRegisterMenu((s) => !s);
  }

  function navigateAndClose(path: string) {
    navigate(path);
    setShowRegisterMenu(false);
  }

  function navigateMain(path: string) {
    setShowRegisterMenu(false);
    navigate(path);
  }

  async function handleLogout() {
    try {
      await fetch("/auth/sign-out", {
        method: "POST",
        credentials: "include",
      });
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      navigate("/login");
    }
  }

  return (
    <>
      {/* SUBMENÚ REGISTRAR */}
      {showRegisterMenu && (
        <div className="md3-bottom-nav-register-menu">
          <button
            className={
              "md3-bottom-nav-register-option" +
              (registerActive === "computers"
                ? " md3-bottom-nav-register-option--active"
                : "")
            }
            onClick={() => navigateAndClose("/computers/checkin")}
          >
            🖥️ Computadores
          </button>

          <button
            className={
              "md3-bottom-nav-register-option" +
              (registerActive === "medical"
                ? " md3-bottom-nav-register-option--active"
                : "")
            }
            onClick={() => navigateAndClose("/medical/checkin")}
          >
            🏥 Biomédico
          </button>
        </div>
      )}

      {/* ESPACIO PARA QUE EL NAV NO TAPE EL CONTENIDO */}
      <div className="md3-bottom-nav-safe-space" aria-hidden="true" />

      {/* NAV INFERIOR */}
      <nav className="md3-bottom-nav-wrapper">
        <div className="md3-bottom-nav">
          {/* Acciones principales */}
          <div className="md3-bottom-nav-main">
            {/* HISTORY */}
            <button
              type="button"
              className={
                "md3-bottom-nav-action" +
                (active === "history"
                  ? " md3-bottom-nav-action--active"
                  : "")
              }
              onClick={() => navigateMain("/devices/entered")}
            >
              <span className="md3-bottom-nav-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2a7 7 0 017 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 017-7z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                  <circle
                    cx="12"
                    cy="9"
                    r="2.5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                </svg>
              </span>
              <span className="md3-bottom-nav-label">Historial</span>
            </button>

            {/* DASHBOARD (computadores frecuentes) */}
            <button
              type="button"
              className={
                "md3-bottom-nav-action" +
                (active === "dashboard"
                  ? " md3-bottom-nav-action--active"
                  : "")
              }
              onClick={() => navigateMain("/computers/frequent")}
            >
              <span className="md3-bottom-nav-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                  <path
                    d="M12 6v6l4 2"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <span className="md3-bottom-nav-label">Dashboard</span>
            </button>

            {/* COMPANIES */}
            <button
              type="button"
              className={
                "md3-bottom-nav-action" +
                (active === "companies"
                  ? " md3-bottom-nav-action--active"
                  : "")
              }
              onClick={() => navigateMain("/companies")}
            >
              <span className="md3-bottom-nav-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="4"
                    y="3"
                    width="10"
                    height="18"
                    rx="1.5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                  <rect
                    x="15"
                    y="9"
                    width="5"
                    height="12"
                    rx="1.5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                  <path
                    d="M8 7h2M8 11h2M8 15h2"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <span className="md3-bottom-nav-label">Empresas</span>
            </button>

            {/* AUDITS */}
            <button
              type="button"
              className={
                "md3-bottom-nav-action" +
                (active === "audits"
                  ? " md3-bottom-nav-action--active"
                  : "")
              }
              onClick={() => navigateMain("/audit/me")}
            >
              <span className="md3-bottom-nav-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="3"
                    y="3"
                    width="18"
                    height="18"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                  <path
                    d="M7 9h10M7 13h6M7 17h4"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <span className="md3-bottom-nav-label">Auditorías</span>
            </button>

            {/* REGISTER */}
            <button
              type="button"
              onClick={toggleRegisterMenu}
              className={
                "md3-bottom-nav-action" +
                (active === "register"
                  ? " md3-bottom-nav-action--active"
                  : "")
              }
            >
              <span className="md3-bottom-nav-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <circle
                    cx="12"
                    cy="7"
                    r="4"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                  <path
                    d="M4 20a8 8 0 0116 0"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <span className="md3-bottom-nav-label">Registrar</span>
            </button>
          </div>

          {/* Logout discreto, solo iconito */}
          <button
            type="button"
            className="md3-bottom-nav-logout-icon-btn"
            onClick={handleLogout}
            aria-label="Cerrar sesión"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
              <path
                d="M16 17l5-5-5-5"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M21 12H9"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </nav>
    </>
  );
}
