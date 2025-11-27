import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChangePassword = async () => {
    setError(null);
    setMessage(null);

    if (!email || !password || !confirm) {
      setError("Por favor completa todos los campos.");
      return;
    }

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      setPassword("");
      setConfirm("");
      return;
    }

    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      setPassword("");
      setConfirm("");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error al cambiar contraseña");
      }

      setMessage("Contraseña actualizada correctamente. Ahora puedes iniciar sesión.");
      setPassword("");
      setConfirm("");

      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      setError(err.message || "Error al cambiar contraseña");
      setPassword("");
      setConfirm("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card-header">
          <h1>Olvidé mi contraseña</h1>
        </div>

        <div className="auth-card-body">
          {/* Correo */}
          <label className="auth-label" htmlFor="usuario">
            Usuario (correo)
          </label>
          <input
            id="usuario"
            type="email"
            className="auth-input"
            placeholder="Ingresa tu correo registrado"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* Nueva contraseña */}
          <label className="auth-label" htmlFor="password">
            Nueva contraseña
          </label>
          <input
            id="password"
            type="password"
            className="auth-input"
            placeholder="Escribe tu nueva contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Confirmar */}
          <label className="auth-label" htmlFor="password2">
            Confirmar contraseña
          </label>
          <input
            id="password2"
            type="password"
            className="auth-input"
            placeholder="Repite tu nueva contraseña"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />

          {/* Errores / Éxito */}
          {error && (
            <p className="auth-error-text" style={{ color: "red", textAlign: "center" }}>
              {error}
            </p>
          )}

          {message && (
            <p className="auth-success-text" style={{ color: "green", textAlign: "center" }}>
              {message}
            </p>
          )}

          {/* Botón cambiar contraseña */}
          <button
            className="auth-submit-button"
            onClick={handleChangePassword}
            disabled={loading}
          >
            {loading ? "Actualizando..." : "Actualizar contraseña"}
          </button>

          <p className="auth-helper-text auth-helper-center">
            ¿Recordaste tu contraseña?
            <button
              onClick={() => navigate("/login")}
              className="auth-link-button"
            >
              (Inicia sesión aquí.)
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
