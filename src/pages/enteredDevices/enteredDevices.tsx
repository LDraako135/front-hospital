import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./enteredDevices.css";

type DeviceCard = {
  id: string;
  model: string;
  provider: string;
  user: string;
  entryTime: string;
  exitTime: string;
};

// Lo que llega desde tu API /api/devices/entered
type EnteredDeviceApi = {
  device: {
    id: string;
    brand: string;
    model: string;
    owner: {
      name: string;
      id: string;
    };
  };
  checkinAt: string;
  checkoutAt?: string | null;
};

const API_URL = "/api/devices/entered"; // 👈 tu controlador tiene prefix /api + /devices/entered

export default function EnteredDevices() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [devices, setDevices] = useState<DeviceCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --------- 🔗 Cargar dispositivos desde tu backend ---------
  useEffect(() => {
    async function loadDevices() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(API_URL, {
          // si usas JWT o algo en AuthMiddleware, agrega headers aquí:
          // headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) {
          throw new Error(`Error HTTP ${res.status}`);
        }

        const data: EnteredDeviceApi[] = await res.json();

        // Mapear a lo que tu UI espera
        const mapped: DeviceCard[] = data.map((item) => ({
          id: item.device.id,
          model: item.device.model,
          provider: item.device.brand,
          user: item.device.owner.name,
          entryTime: new Date(item.checkinAt).toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          exitTime: item.checkoutAt
            ? new Date(item.checkoutAt).toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "—",
        }));

        setDevices(mapped);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los dispositivos ingresados.");
      } finally {
        setLoading(false);
      }
    }

    loadDevices();
  }, []);

  // ---------- 🔍 Normalizador para búsqueda ----------
  const normalize = (text: string) =>
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  // ---------- 🔍 Filtro que busca en todos los campos ----------
  const filteredDevices = devices.filter((device) => {
    const searchText = normalize(search);
    if (!searchText) return true;

    const fullText = normalize(
      `${device.model} 
       ${device.provider} 
       ${device.user} 
       ${device.entryTime} 
       ${device.exitTime}`
    );

    return fullText.includes(searchText);
  });

  return (
    <main className="md3-page">
      <section className="md3-card fd-card">
        <h1 className="fd-title">Dispositivos ingresados</h1>

        <button
          className="new-entry-btn"
          onClick={() => navigate("/medical/checkin")}
        >
          + Nuevo ingreso
        </button>

        {/* Buscador */}
        <div className="fd-search-row">
          <div className="fd-search-box">
            <span className="fd-search-icon">🔍</span>
            <input
              className="fd-search-input"
              placeholder="Buscar dispositivo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Estados */}
        {loading && (
          <p className="fd-status-text">Cargando dispositivos…</p>
        )}

        {error && !loading && (
          <p className="fd-status-text fd-status-error">{error}</p>
        )}

        {!loading && !error && filteredDevices.length === 0 && (
          <p className="fd-status-text">
            No se encontraron dispositivos ingresados.
          </p>
        )}

        {!loading && !error && filteredDevices.length > 0 && (
          <div className="devices-grid">
            {filteredDevices.map((device) => (
              <div
                key={device.id}
                className="device-card"
                // más adelante si haces detalle:
                // onClick={() => navigate(`/device/${device.id}`)}
              >
                {/* Imagen */}
                <div className="device-card-img">
                  <svg viewBox="0 0 400 220" className="device-svg">
                    <g opacity="0.35">
                      <path
                        transform="translate(-20, -20)"
                        d="M190 40c6-12 24-12 30 0l12 24c6 12-3 27-17 27h-20c-14 0-23-15-17-27l12-24z"
                        fill="#413f43ff"
                      />
                      <circle cx="100" cy="135" r="30" fill="#413f43ff" />
                      <rect
                        x="245"
                        y="100"
                        width="60"
                        height="60"
                        rx="12"
                        fill="#413f43ff"
                      />
                    </g>
                  </svg>
                </div>

                {/* Info */}
                <div className="device-card-info">
                  <div className="device-info-row">
                    <span className="device-label">Modelo:</span>
                    <span className="device-value">{device.model}</span>
                  </div>
                  <div className="device-info-row">
                    <span className="device-label">Proveedor:</span>
                    <span className="device-value">{device.provider}</span>
                  </div>
                  <div className="device-info-row">
                    <span className="device-label">Nombre:</span>
                    <span className="device-value">{device.user}</span>
                  </div>
                  <div className="device-info-row">
                    <span className="device-label">Hora de entrada:</span>
                    <span className="device-value">{device.entryTime}</span>
                  </div>
                  <div className="device-info-row">
                    <span className="device-label">Hora de salida:</span>
                    <span className="device-value">{device.exitTime}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}