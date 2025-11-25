import "./Auth.css";

export default function Register() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card-header">
          <h1>Registro</h1>
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
            placeholder="Elige tu usuario"
          />

          {/* Correo */}
          <label className="auth-label" htmlFor="email">
            Correo
          </label>
          <input
            id="email"
            type="email"
            className="auth-input"
            placeholder="tucorreo@ejemplo.com"
          />

          {/* Contraseña */}
          <label className="auth-label" htmlFor="password">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            className="auth-input"
            placeholder="Crea una contraseña"
          />

          {/* Confirmar contraseña */}
          <label className="auth-label" htmlFor="password2">
            Confirmar contraseña
          </label>
          <input
            id="password2"
            type="password"
            className="auth-input"
            placeholder="Repite tu contraseña"
          />

          <button className="auth-submit-button">Registrarse</button>

          <p className="auth-helper-text auth-helper-center">
            ¿Ya tienes cuenta?
            <a href="/login" className="auth-link">
              (Inicia sesión aquí).
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
