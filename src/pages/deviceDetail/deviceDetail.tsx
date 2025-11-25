import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import "./deviceDetail.css";

export default function DeviceDetail() {
  const navigate = useNavigate();
  const [device, setDevice] = useState<any>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("selectedDevice");
    if (stored) {
      try {
        setDevice(JSON.parse(stored));
      } catch {
        setDevice(null);
      }
    }
  }, []);

  const handleExit = async () => {
    if (!device) return;

    // si ya tiene salida, no hacemos nada
    if (device.exitTime) {
      alert("Este dispositivo ya tiene una salida registrada.");
      return;
    }

    try {
      const res = await fetch(`/api/devices/checkout/${device.id}`, {
        method: "PATCH",
      });

      if (!res.ok) throw new Error("Error al registrar salida");

      const now = new Date();
      const exitTime = now.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const updated = { ...device, exitTime };
      sessionStorage.setItem("selectedDevice", JSON.stringify(updated));
      setDevice(updated);

      alert("Salida registrada");
      navigate("/devices/entered");
    } catch (err) {
      console.error(err);
      alert("Error registrando salida");
    }
  };

  const handleCreateFrequent = () => {
    // si es computador, lo mandamos a crear ingreso frecuente ("dar entrada frecuente")
    if (device?.kind === "computer") {
      navigate("/computers/checkin?frequent=1");
    } else {
      // si es biomédico, simplemente a ingreso biomédico normal
      navigate("/medical/checkin");
    }
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

        {/* FREQUENTLY QR SOLO PARA COMPUTADORES */}
        {isComputer && (
          <div className="detail-frequent-box">
            <div className="freq-left">
              <h3 className="freq-title">Frequently QR</h3>
              <p className="freq-text">
                Usa estos códigos o el flujo de entrada frecuente para registrar
                ingreso de este computador.
              </p>
              <button className="freq-btn" onClick={handleCreateFrequent}>
                Dar entrada frecuente
              </button>
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
