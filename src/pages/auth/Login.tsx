import { useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError(null);
    if (!username || !password) {
      setError("Por favor completa todos los campos.");
      return;
    }

    if (!captchaToken) {
      setError("Por favor completa el captcha.");
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch("/auth/sign-in/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-captcha-response": captchaToken,
        },
        body: JSON.stringify({
          email: username,
          password: password,
        }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error en el login");
      }

      // Login exitoso
      navigate("/computers/checkin");
    } catch (err: any) {
      setError(err.message || "Error en el login");
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card-header">
          <h1>Inicio Sesión</h1>
        </div>

        <div className="auth-card-body">
          {/* Logo */}
          <div className="auth-logo-box">Logo..</div>

          {/* Usuario */}
          <label className="auth-label" htmlFor="usuario">
            Correo
          </label>
          <input
            id="usuario"
            type="email"
            className="auth-input"
            placeholder="Ingresa tu correo"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div style={{ margin: "20px 0", display: "flex", justifyContent: "center" }}>
            <ReCAPTCHA
              sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || "YOUR_SITE_KEY_HERE"}
              onChange={(token) => setCaptchaToken(token)}
            />
          </div>

          {error && <p className="auth-error-text" style={{ color: "red", textAlign: "center" }}>{error}</p>}

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

          <button className="auth-submit-button" onClick={handleLogin} disabled={loading}>
            {loading ? "Ingresando..." : "Ingresar"}
          </button>

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
