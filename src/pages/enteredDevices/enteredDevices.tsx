import { useEffect, useState } from "react";
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

  // texto ya formateado "HH:MM"
  entryTime: string;
  // 👇 AHORA PUEDE SER null (nuevo = sin salida)
  exitTime: string | null;

  photoUrl: string | null;

  isFrequent: boolean;
};

const MEDICAL_URL = "/api/medicaldevices";
const COMPUTERS_URL = "/api/computers";
const FREQUENT_COMPUTERS_URL = "/api/computers/frequent";

export default function EnteredDevices() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [devices, setDevices] = useState<DeviceCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDevices() {
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
        if (!freqRes.ok)
          throw new Error("Error al cargar computadores frecuentes");

        const medicalData: any[] = await medRes.json();
        const computerData: any[] = await compRes.json();
        const frequentRaw: any[] = await freqRes.json();

        const frequentIds = new Set<string>();
        frequentRaw.forEach((item: any) => {
          const d = item.device ?? item;
          if (d && d.id) frequentIds.add(d.id);
        });

        const medicalCards: DeviceCard[] = medicalData.map((md) => ({
          id: md.id,
          kind: "medical",
          brand: md.brand,
          model: md.model,
          userName: md.owner?.name ?? "Sin usuario",
          userId: md.owner?.id ?? null,
          color: null,
          serial: md.serial ?? null,

          // Hora de entrada
          entryTime: new Date(md.checkinAt ?? md.updatedAt).toLocaleTimeString(
            "es-ES",
            {
              hour: "2-digit",
              minute: "2-digit",
            }
          ),

          // ❌ ANTES: checkoutAt o updatedAt
          // ✅ AHORA: SOLO checkoutAt. Si no hay, NO tiene salida -> null
          exitTime: md.checkoutAt
            ? new Date(md.checkoutAt).toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : null,

          photoUrl: md.photoURL ?? null,
          isFrequent: false,
        }));

        const computerCards: DeviceCard[] = computerData.map((pc) => ({
          id: pc.id,
          kind: "computer",
          brand: pc.brand,
          model: pc.model,
          userName: pc.owner?.name ?? "Sin usuario",
          userId: pc.owner?.id ?? null,
          color: pc.color ?? null,
          serial: null,

          // Hora de entrada
          entryTime: new Date(pc.checkinAt ?? pc.updatedAt).toLocaleTimeString(
            "es-ES",
            {
              hour: "2-digit",
              minute: "2-digit",
            }
          ),

          // ❌ ANTES: checkoutAt o updatedAt
          // ✅ AHORA: SOLO checkoutAt, nuevo = null
          exitTime: pc.checkoutAt
            ? new Date(pc.checkoutAt).toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : null,

          photoUrl: pc.photoURL ?? null,
          isFrequent: frequentIds.has(pc.id),
        }));

        setDevices([...medicalCards, ...computerCards]);
      } catch (err: any) {
        console.error(err);
        setError(err?.message ?? "Error al cargar dispositivos");
      } finally {
        setLoading(false);
      }
    }

    loadDevices();
  }, []);

  const normalize = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  const filteredDevices = devices.filter((d) => {
    if (!search) return true;

    const frequentLabel =
      d.kind === "computer"
        ? d.isFrequent
          ? "computador frecuente"
          : "computador no frecuente"
        : "";

    const text = normalize(
      `${d.brand} ${d.model} ${d.userName} ${d.userId ?? ""} ${d.serial ?? ""} ${
        d.color ?? ""
      } ${frequentLabel}`
    );

    return text.includes(normalize(search));
  });

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
            <span className="ed-search-icon"></span>
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
            {filteredDevices.map((d) => (
              <article
                key={d.id}
                className="ed-device-card"
                onClick={() => {
                  // 👉 Aquí guardamos lo que va a leer DeviceDetail
                  sessionStorage.setItem(
                    "selectedDevice",
                    JSON.stringify(d)
                  );
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
                        <button className="ed-tag">
                          {d.kind === "medical"
                            ? "Dispositivo biomédico"
                            : "Computador"}
                        </button>

                        {d.kind === "computer" && (
                          <button className="ed-tag">
                            {d.isFrequent
                              ? "Computador frecuente"
                              : "Computador no frecuente"}
                          </button>
                        )}

                        {d.serial && (
                          <button className="ed-tag">Serial: {d.serial}</button>
                        )}

                        {d.color && (
                          <button className="ed-tag">Color: {d.color}</button>
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
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
