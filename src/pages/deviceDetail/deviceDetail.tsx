import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import "./deviceDetail.css";

type DeviceKind = "computer" | "medical";

type DeviceCard = {
  id: string;
  kind: DeviceKind;

  brand: string;
  model: string;
  userName: string;
  userId: string | null;

  color: string | null;
  serial: string | null;

  entryTime: string;       // texto tipo "HH:MM"
  exitTime: string | null; // null = sin salida

  photoUrl: string | null;

  isFrequent: boolean;
};

export default function DeviceDetail() {
  const navigate = useNavigate();
  const [device, setDevice] = useState<DeviceCard | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("selectedDevice");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as DeviceCard;
        setDevice(parsed);
      } catch {
        setDevice(null);
      }
    }
  }, []);

  const handleExit = async () => {
    if (!device) return;

    // Si ya le registraste salida antes, no hace nada
    if (device.exitTime) {
      alert("Este dispositivo ya tiene una salida registrada.");
      return;
    }

    try {
      const res = await fetch(`/api/devices/checkout/${device.id}`, {
        method: "PATCH",
      });

      if (!res.ok) throw new Error("Error al registrar salida");

      // La hora de salida la definimos aquí en el front
      const now = new Date();
      const exitTime = now.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const updated: DeviceCard = {
        ...device,
        exitTime,
      };

      sessionStorage.setItem("selectedDevice", JSON.stringify(updated));
      setDevice(updated);

      alert("Salida registrada");
      navigate("/devices/entered");
    } catch (err) {
      console.error(err);
      alert("Error registrando salida");
    }
  };

  // 🔁 Versión sin CORS: solo navega al flujo de “computador frecuente”
  const handleCreateFrequent = () => {
    if (!device) return;
    if (device.kind !== "computer") {
      alert("Solo los computadores pueden ser frecuentes.");
      return;
    }

    // Lo mandamos al formulario de computadores en modo frecuente
    navigate("/computers/checkin?frequent=1", {
      state: {
        fromDeviceDetail: true,
        deviceId: device.id,
        brand: device.brand,
        model: device.model,
        color: device.color,
        userName: device.userName,
        userId: device.userId,
        photoUrl: device.photoUrl,
      },
    });
  };

  if (!device) {
    return (
      <main className="page">
        <h2>No se encontró información del dispositivo.</h2>
        <button onClick={() => navigate(-1)}>Volver</button>
      </main>
    );
  }

  const appOrigin =
    typeof window !== "undefined" ? window.location.origin : "";

  const isComputer = device.kind === "computer";
  const hasExit = Boolean(device.exitTime);

  return (
    <main className="detail-page">
      <section className="detail-card">
        {/* TÍTULO PRINCIPAL */}
        <div className="detail-header">
          <h2 className="detail-title">
            {device.kind === "medical" ? "External / Biomedical" : "Computador"}
          </h2>
          <span className="detail-model">{device.model}</span>
        </div>

        {/* IMAGEN */}
        <div className="detail-image-box">
          {device.photoUrl ? (
            <img src={device.photoUrl} className="detail-image" />
          ) : (
            <div className="detail-placeholder">
              <svg viewBox="0 0 200 200">
                <g opacity="0.25">
                  <rect
                    x="20"
                    y="20"
                    width="160"
                    height="160"
                    fill="#c9bfd6"
                    rx="20"
                  />
                </g>
              </svg>
            </div>
          )}
        </div>

        {/* INFO DEL USUARIO */}
        <div className="detail-info-section">
          <h3 className="detail-section-title">
            Identificador único (Serial)
          </h3>

          <p className="detail-user">{device.userName}</p>
          <p className="detail-user-id">{device.userId}</p>

          <div className="detail-tags">
            {device.serial && (
              <span className="tag">Serial: {device.serial}</span>
            )}
            {device.color && (
              <span className="tag">Color: {device.color}</span>
            )}
            <span className="tag">{device.brand}</span>
          </div>
        </div>

        {/* REGISTRO DE TIEMPOS */}
        <div className="detail-info-section">
          <h3 className="detail-section-title">Registro de tiempos</h3>

          <p className="detail-user">Entrada: {device.entryTime}</p>
          <p className="detail-user">
            Salida: {device.exitTime ? device.exitTime : "—"}
          </p>
        </div>

        {/* FREQUENTLY QR SOLO PARA COMPUTADORES */}
        {isComputer && (
          <div className="detail-frequent-box">
            <div className="freq-left">
              <h3 className="freq-title">
                {device.isFrequent ? "Computador frecuente" : "Frequently QR"}
              </h3>
              <p className="freq-text">
                Usa estos códigos o el flujo de entrada frecuente para registrar
                ingreso de este computador.
              </p>

              {!device.isFrequent && (
                <button className="freq-btn" onClick={handleCreateFrequent}>
                  Dar entrada frecuente
                </button>
              )}

              {device.isFrequent && (
                <p className="freq-text">
                  Este computador ya está registrado como frecuente.
                </p>
              )}
            </div>

            <div className="freq-qr-column">
              <div className="freq-qr-block">
                <p className="freq-qr-label">Entrada</p>
                <div className="freq-qr-inner">
                  <QRCodeSVG
                    value={`${appOrigin}/frequent/qr/checkin/${device.id}`}
                    size={120}
                  />
                </div>
              </div>

              <div className="freq-qr-block">
                <p className="freq-qr-label">Salida</p>
                <div className="freq-qr-inner">
                  <QRCodeSVG
                    value={`${appOrigin}/frequent/qr/checkout/${device.id}`}
                    size={120}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BOTÓN DAR SALIDA */}
        <button
          className="exit-btn"
          onClick={handleExit}
          disabled={hasExit}
        >
          {hasExit ? "Salida ya registrada" : "Dar salida"}
        </button>
      </section>
    </main>
  );
}
