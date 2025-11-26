import { useEffect, useState, useMemo } from "react";
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

  entryTime: string;       // "HH:MM"
  exitTime: string | null; // null = sin salida

  photoUrl: string | null;
  isFrequent: boolean;
};

export default function DeviceDetail() {
  const navigate = useNavigate();
  const [device, setDevice] = useState<DeviceCard | null>(null);
  const [creatingFrequent, setCreatingFrequent] = useState(false);

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

  const appOrigin =
    typeof window !== "undefined" ? window.location.origin : "";

  const isComputer = device?.kind === "computer";
  const hasExit = Boolean(device?.exitTime);

  // Resolver URL de la foto
  const resolvedPhoto = useMemo(() => {
    if (!device?.photoUrl) return null;

    const raw = device.photoUrl.trim();

    if (raw.startsWith("http://") || raw.startsWith("https://")) {
      return raw;
    }

    let path = raw.replace(/^\/+/, ""); // quitar barras iniciales

    if (!path.startsWith("uploads/")) {
      path = `uploads/${path}`;
    }

    return `/${path}`; // /uploads/archivo.jpg
  }, [device?.photoUrl]);

  // === DAR SALIDA (solo guarda la hora local, SIN backend) ===
  const handleExit = () => {
    if (!device) return;

    if (device.exitTime) {
      alert("Este dispositivo ya tiene una salida registrada.");
      return;
    }

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

    alert("Salida registrada correctamente.");
    // Si quieres volver a la lista, descomenta:
    // navigate("/devices/entered");
  };

  // === DAR ENTRADA FRECUENTE (crear computador frecuente) ===
  const handleCreateFrequent = async () => {
    if (!device) return;
    if (!isComputer) {
      alert("Solo los computadores pueden ser frecuentes.");
      return;
    }
    if (device.isFrequent) {
      alert("Este computador ya es frecuente.");
      return;
    }

    const ok = window.confirm(
      "¿Deseas marcar este computador como frecuente y crear su registro de entrada frecuente?"
    );
    if (!ok) return;

    try {
      setCreatingFrequent(true);

      const form = new FormData();
      form.append("brand", device.brand);
      form.append("model", device.model);
      form.append("color", device.color ?? "");
      form.append("ownerName", device.userName);
      form.append("ownerId", device.userId ?? "");
      form.append("descriptions", "Creado desde detalle de dispositivo");
      form.append("isFrequent", "true");

      // Reusar la foto si existe
      if (resolvedPhoto) {
        try {
          const imgRes = await fetch(resolvedPhoto);
          if (imgRes.ok) {
            const blob = await imgRes.blob();
            const mime = blob.type || "image/jpeg";
            const ext = mime.split("/")[1] || "jpg";
            const filename = `${device.model || "computador"}-frecuente.${ext}`;
            const file = new File([blob], filename, { type: mime });

            form.append("photo", file);
          } else {
            console.warn(
              "No se pudo leer la foto para frecuente, status:",
              imgRes.status
            );
          }
        } catch (e) {
          console.warn("Error obteniendo la imagen para frecuente:", e);
        }
      }

      const res = await fetch("/api/computers/frequent", {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        let msg = "Error al marcar como frecuente.";
        try {
          const data = await res.json();
          if (data?.message) msg = data.message;
        } catch {
          // ignorar si no hay JSON
        }
        throw new Error(msg);
      }

      const updated: DeviceCard = {
        ...device,
        isFrequent: true,
      };
      sessionStorage.setItem("selectedDevice", JSON.stringify(updated));
      setDevice(updated);

      alert("Computador marcado como frecuente correctamente.");
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Error al marcar como frecuente.");
    } finally {
      setCreatingFrequent(false);
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
          {resolvedPhoto ? (
            <img src={resolvedPhoto} className="detail-image" />
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
            {device.color && <span className="tag">Color: {device.color}</span>}
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
                <button
                  className="freq-btn"
                  onClick={handleCreateFrequent}
                  disabled={creatingFrequent}
                >
                  {creatingFrequent
                    ? "Marcando como frecuente…"
                    : "Dar entrada frecuente"}
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
