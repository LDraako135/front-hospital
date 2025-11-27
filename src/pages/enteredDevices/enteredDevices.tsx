import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./enteredDevices.css";

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

  entryTime: string;
  exitTime: string | null;

  photoUrl: string | null;

  isFrequent: boolean;
};

const MEDICAL_URL = "/api/medicaldevices";
const COMPUTERS_URL = "/api/computers";
const FREQUENT_COMPUTERS_URL = "/api/computers/frequent";

// === Helper AUDITORÍA ===
async function logAudit(action: "CREATE" | "UPDATE" | "DELETE", device: DeviceCard) {
  try {
    await fetch("/api/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        kind: device.kind,
        deviceId: device.id,
        brand: device.brand,
        model: device.model,
        userName: device.userName,
        userId: device.userId,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (e) {
    console.warn("No se pudo registrar auditoría:", e);
  }
}

// Normalizador para el buscador
const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

// Construye la URL final de la imagen
function buildPhotoUrl(raw: unknown): string | null {
  if (!raw) return null;
  let path = String(raw).trim();
  if (!path) return null;

  // Si ya viene con http(s), úsala tal cual
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // Si viene como /uploads/archivo.jpg
  if (path.startsWith("/uploads/")) {
    return path;
  }

  // Si viene como uploads/archivo.jpg
  if (path.startsWith("uploads/")) {
    path = path.replace(/^uploads\/+/, "");
  }

  // Caso normal: solo filename → "xxxxxx.jpg"
  return `/uploads/${path}`;
}

// Hora de entrada desde varios campos
function getEntryTime(obj: any): string {
  const raw =
    obj.checkinAt ||
    obj.checkInAt ||
    obj.entryTime ||
    obj.createdAt ||
    obj.created_at ||
    obj.updatedAt ||
    obj.updated_at;

  if (!raw) return "—";

  const date = new Date(raw);
  if (isNaN(date.getTime())) {
    if (typeof raw === "string") return raw;
    return "—";
  }

  return date.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Hora de salida desde varios campos
function getExitTime(obj: any): string | null {
  const raw =
    obj.checkoutAt ||
    obj.checkOutAt ||
    obj.exitTime ||
    obj.exit_time ||
    obj.exit_at;

  if (!raw) return null;

  const date = new Date(raw);
  if (isNaN(date.getTime())) {
    if (typeof raw === "string") return raw;
    return null;
  }

  return date.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function EnteredDevices() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [devices, setDevices] = useState<DeviceCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const [medRes, compRes, freqRes] = await Promise.all([
          fetch(MEDICAL_URL),
          fetch(COMPUTERS_URL),
          fetch(FREQUENT_COMPUTERS_URL),
        ]);

        if (!medRes.ok) throw new Error("Error al cargar dispositivos médicos");
        if (!compRes.ok) throw new Error("Error al cargar computadores");
        if (!freqRes.ok) throw new Error("Error al cargar computadores frecuentes");

        const medicalData: any[] = await medRes.json();
        const computerData: any[] = await compRes.json();
        const frequentData: any[] = await freqRes.json();

        const frequentIds = new Set<string>(
          frequentData.map((f) => String(f.id)).filter(Boolean)
        );

        const medicalCards: DeviceCard[] = medicalData.map((md) => {
          const id = String(md.id);
          const photoUrl = buildPhotoUrl(md.photo);

          return {
            id,
            kind: "medical",
            brand: md.brand ?? md.provider ?? "Sin proveedor",
            model: md.model ?? "Sin modelo",
            userName: md.ownerName ?? "Sin usuario",
            userId: md.ownerId ?? null,
            color: null,
            serial: md.serial ?? null,
            entryTime: getEntryTime(md),
            exitTime: getExitTime(md),
            photoUrl,
            isFrequent: false,
          };
        });

        const computerCards: DeviceCard[] = computerData.map((pc) => {
          const id = String(pc.id);
          const photoUrl = buildPhotoUrl(pc.photo);

          return {
            id,
            kind: "computer",
            brand: pc.brand ?? "Sin marca",
            model: pc.model ?? "Sin modelo",
            userName: pc.ownerName ?? "Sin usuario",
            userId: pc.ownerId ?? null,
            color: pc.color ?? null,
            serial: null,
            entryTime: getEntryTime(pc),
            exitTime: getExitTime(pc),
            photoUrl,
            isFrequent: frequentIds.has(id),
          };
        });

        // Mezclamos con sessionStorage (selectedDevice)
        let merged: DeviceCard[] = [...medicalCards, ...computerCards];

        try {
          const stored = sessionStorage.getItem("selectedDevice");
          if (stored) {
            const storedDevice = JSON.parse(stored) as DeviceCard;
            if (storedDevice && storedDevice.id) {
              merged = merged.map((dev) =>
                dev.id === storedDevice.id
                  ? {
                      ...dev,
                      exitTime: storedDevice.exitTime ?? dev.exitTime,
                      isFrequent: storedDevice.isFrequent ?? dev.isFrequent,
                    }
                  : dev
              );
            }
          }
        } catch {
          // ignoramos errores de parse
        }

        setDevices(merged);
      } catch (err: any) {
        console.error(err);
        setError(err?.message || "Error al cargar dispositivos");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filteredDevices = useMemo(() => {
    if (!search) return devices;
    const term = normalize(search);

    return devices.filter((d) => {
      const frequentLabel =
        d.kind === "computer"
          ? d.isFrequent
            ? "computador frecuente"
            : "computador no frecuente"
          : "";

      const text = normalize(
        `${d.brand} ${d.model} ${d.userName} ${d.userId ?? ""} ${
          d.serial ?? ""
        } ${d.color ?? ""} ${frequentLabel}`
      );

      return text.includes(term);
    });
  }, [devices, search]);

  // === ELIMINAR ===
  const handleDelete = async (e: React.MouseEvent, device: DeviceCard) => {
    e.stopPropagation();

    const ok = window.confirm(
      `¿Seguro que quieres eliminar este ${
        device.kind === "medical" ? "dispositivo biomédico" : "computador"
      }?`
    );
    if (!ok) return;

    try {
      const endpoint =
        device.kind === "medical"
          ? `/api/medicaldevices/${device.id}`
          : `/api/computers/${device.id}`;

      const res = await fetch(endpoint, { method: "DELETE" });
      if (!res.ok) {
        throw new Error("Error al eliminar dispositivo");
      }

      setDevices((prev) =>
        prev.filter((d) => !(d.id === device.id && d.kind === device.kind))
      );

      // Auditoría
      await logAudit("DELETE", device);

      alert("Dispositivo eliminado correctamente.");
    } catch (err) {
      console.error(err);
      alert("Error al eliminar el dispositivo.");
    }
  };

  // === EDITAR ===
  const handleEdit = (e: React.MouseEvent, device: DeviceCard) => {
    e.stopPropagation();
    // Guardamos en sessionStorage para usarlo en DeviceEdit
    sessionStorage.setItem("selectedDevice", JSON.stringify(device));
    navigate("/devices/edit");
  };

  return (
    <main className="ed-page">
      <section className="ed-container">
        <header className="ed-header">
          <h1 className="ed-title">Dispositivos ingresados</h1>

          <div className="ed-header-buttons">
            <button
              className="ed-new-button"
              onClick={() => navigate("/medical/checkin")}
            >
              Ingreso Biomédico
            </button>

            <button
              className="ed-new-button ed-new-button--pc"
              onClick={() => navigate("/computers/checkin")}
            >
              Ingreso Computador
            </button>
          </div>
        </header>

        <div className="ed-search-row">
          <div className="ed-search-box">
            <button type="button" className="ed-search-icon-btn">
              ☰
            </button>
            <input
              className="ed-search-input"
              placeholder="Buscar por marca, modelo, usuario, serial, color…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="ed-search-icon">🔍</span>
          </div>
        </div>

        {loading && (
          <p className="ed-status-text">Cargando dispositivos ingresados…</p>
        )}
        {error && !loading && (
          <p className="ed-status-text ed-status-error">{error}</p>
        )}
        {!loading && !error && filteredDevices.length === 0 && (
          <p className="ed-status-text">
            No se encontraron dispositivos ingresados.
          </p>
        )}

        {!loading && !error && filteredDevices.length > 0 && (
          <div className="ed-device-list">
            {filteredDevices.map((d, index) => (
              <article
                key={`${d.kind}-${d.id}-${index}`}
                className="ed-device-card"
                onClick={() => {
                  sessionStorage.setItem("selectedDevice", JSON.stringify(d));
                  navigate(`/devices/${d.id}`);
                }}
                style={{ cursor: "pointer" }}
              >
                <div className="ed-card-media">
                  {d.photoUrl ? (
                    <img
                      src={d.photoUrl}
                      alt={d.model}
                      className="ed-card-img"
                      onError={(e) => {
                        console.warn(
                          "Error cargando imagen:",
                          d.photoUrl,
                          "para id",
                          d.id
                        );
                        (e.currentTarget as HTMLImageElement).style.display =
                          "none";
                      }}
                    />
                  ) : (
                    <svg
                      viewBox="0 0 400 220"
                      className="ed-card-placeholder"
                    >
                      <g opacity="0.35">
                        <rect
                          x="50"
                          y="40"
                          width="300"
                          height="150"
                          fill="#bdb4c8"
                        />
                      </g>
                    </svg>
                  )}
                </div>

                <div className="ed-card-content">
                  <div className="ed-info-grid">
                    <div className="ed-info-col">
                      <div className="ed-mini-card ed-mini-card--primary">
                        <span className="ed-mini-label">Modelo:</span>
                        <span className="ed-mini-value">{d.model}</span>
                      </div>

                      <div className="ed-tags-column">
                        <button className="ed-tag ed-tag--kind">
                          {d.kind === "medical"
                            ? "Dispositivo biomédico"
                            : "Computador"}
                        </button>

                        {d.kind === "computer" && (
                          <button
                            className={`ed-tag ${
                              d.isFrequent
                                ? "ed-tag--frequent"
                                : "ed-tag--not-frequent"
                            }`}
                          >
                            {d.isFrequent
                              ? "Computador frecuente"
                              : "Computador no frecuente"}
                          </button>
                        )}

                        {d.serial && (
                          <button className="ed-tag ed-tag--info">
                            Serial: {d.serial}
                          </button>
                        )}

                        {d.color && (
                          <button className="ed-tag ed-tag--info">
                            Color: {d.color}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="ed-info-col">
                      <div className="ed-mini-card">
                        <span className="ed-mini-label">Proveedor:</span>
                        <span className="ed-mini-value">{d.brand}</span>
                      </div>

                      <div className="ed-mini-card">
                        <span className="ed-mini-label">Hora entrada:</span>
                        <span className="ed-mini-value">{d.entryTime}</span>
                      </div>
                    </div>

                    <div className="ed-info-col">
                      <div className="ed-mini-card">
                        <span className="ed-mini-label">Nombre:</span>
                        <span className="ed-mini-value">{d.userName}</span>
                      </div>

                      <div className="ed-mini-card">
                        <span className="ed-mini-label">Hora salida:</span>
                        <span className="ed-mini-value">
                          {d.exitTime ?? "—"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Botones Editar / Eliminar */}
                  <div className="ed-actions-row">
                    <button
                      type="button"
                      className="ed-action-btn ed-action-btn--edit"
                      onClick={(e) => handleEdit(e, d)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="ed-action-btn ed-action-btn--delete"
                      onClick={(e) => handleDelete(e, d)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
