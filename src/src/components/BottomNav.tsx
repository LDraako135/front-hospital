import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./BottomNav.css";

type ActiveTab = "history" | "dashboard" | "register";
type RegisterType = "computers" | "medical" | null;

function getActiveFromPath(path: string): ActiveTab {
  if (path.startsWith("/devices/entered")) return "history";
  if (path.startsWith("/computers/checkin")) return "register";
  if (path.startsWith("/medical/checkin")) return "register";
  if (path.startsWith("/computers/frequent")) return "dashboard";
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

  return (
    <>
      {/* SUBMENÚ */}
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

      <nav className="md3-bottom-nav-wrapper">
        <div className="md3-bottom-nav">

          {/* HISTORY */}
          <button
            type="button"
            className={
              "md3-bottom-nav-action" +
              (active === "history" ? " md3-bottom-nav-action--active" : "")
            }
            onClick={() => navigate("/devices/entered")}
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
            <span className="md3-bottom-nav-label">History</span>
          </button>

          {/* DASHBOARD */}
          <button
            type="button"
            className={
              "md3-bottom-nav-action" +
              (active === "dashboard" ? " md3-bottom-nav-action--active" : "")
            }
            onClick={() => navigate("/computers/frequent")}
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

          {/* REGISTER */}
          <button
            type="button"
            onClick={toggleRegisterMenu}
            className={
              "md3-bottom-nav-action" +
              (active === "register" ? " md3-bottom-nav-action--active" : "")
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
      </nav>
    </>
  );
}
