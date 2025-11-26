import { useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    setError(null);
    if (!name || !email || !password || !confirmPassword) {
      setError("Por favor completa todos los campos.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (!captchaToken) {
      setError("Por favor completa el captcha.");
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch("/auth/sign-up/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-captcha-response": captchaToken,
        },
        body: JSON.stringify({
          email,
          password,
          name,
        }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error en el registro");
      }

      // Registro exitoso
      navigate("/login");
    } catch (err: any) {
      setError(err.message || "Error en el registro");
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card-header">
          <h1>Registro</h1>
        </div>

        <div className="auth-card-body">
          {/* Logo */}
      {/*     <div className="auth-logo-box">Logo..</div> */}

          {/* Usuario */}
          <label className="auth-label" htmlFor="usuario">
            Nombre
          </label>
          <input
            id="usuario"
            type="text"
            className="auth-input"
            placeholder="Elige tu nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <div style={{ margin: "20px 0", display: "flex", justifyContent: "center" }}>
            <ReCAPTCHA
              sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || "YOUR_SITE_KEY_HERE"}
              onChange={(token) => setCaptchaToken(token)}
            />
          </div>

          {error && <p className="auth-error-text" style={{ color: "red", textAlign: "center" }}>{error}</p>}

          <button className="auth-submit-button" onClick={handleRegister} disabled={loading}>
            {loading ? "Registrando..." : "Registrarse"}
          </button>

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
