import "./Auth.css";

export default function Login() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card-header">
          <h1>Inicio Sesión</h1>
        </div>

        <div className="auth-card-body">
          {/* Logo */}
          <div className="auth-logo-box">
            Logo..
          </div>

          {/* Usuario */}
          <label className="auth-label" htmlFor="usuario">
            Usuario
          </label>
          <input
            id="usuario"
            type="text"
            className="auth-input"
            placeholder="Ingresa tu usuario"
          />

          {/* Contraseña */}
          <label className="auth-label" htmlFor="password">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            className="auth-input"
            placeholder="Ingresa tu contraseña"
          />

          {/* Links inferiores */}
          <p className="auth-helper-text">
            No recuerdo mi contraseña
            <button
              type="button"
              className="auth-link-button"
              onClick={() => alert("Ir a recuperar contraseña")}
            >
              (click aquí.)
            </button>
          </p>

          <button className="auth-submit-button">Ingresar</button>

          <p className="auth-helper-text auth-helper-center">
            ¿No estás registrado?
            <a href="/register" className="auth-link">
              (Regístrate aquí).
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
