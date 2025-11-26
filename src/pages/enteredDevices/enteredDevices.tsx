import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./enteredDevices.css";

type EnteredDevice = {
  id: string;
  brand: string;
  model: string;
  owner: {
    id: string;
    name: string;
  } | null;
  type: "computer" | "medical-device" | "frequent-computer";
  checkinAt: string;
  updatedAt: string;
};

const DEVICES_URL = "/api/devices/entered";

export default function DevicesIndexPage() {
  const navigate = useNavigate();

  const [devices, setDevices] = useState<EnteredDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadDevices();
  }, []);

  async function loadDevices() {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(DEVICES_URL, {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Error al cargar equipos");
      }

      const data: EnteredDevice[] = await res.json();
      setDevices(data);
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "Error al cargar equipos");
    } finally {
      setLoading(false);
    }
  }

  const normalize = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  const filteredDevices = devices.filter((d) => {
    if (!search) return true;
    const text = normalize(
      `${d.id} ${d.brand} ${d.model} ${d.owner?.name ?? ""} ${d.type}`
    );
    return text.includes(normalize(search));
  });

  function formatType(t: EnteredDevice["type"]) {
    switch (t) {
      case "computer":
        return "Computador";
      case "medical-device":
        return "Equipo médico";
      case "frequent-computer":
        return "PC frecuente";
      default:
        return t;
    }
  }

  function formatDate(value: string | null | undefined) {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("es-ES");
  }

  // Para la "imagen" placeholder (iniciales marca/modelo)
  function getDeviceInitials(device: EnteredDevice) {
    const brandInitial = device.brand?.[0] ?? "";
    const modelInitial = device.model?.[0] ?? "";
    return (brandInitial + modelInitial).toUpperCase();
  }

  return (
    <main className="ed-page">
      <section className="ed-container">
        {/* Header */}
        <header className="ed-header">
          <h1 className="ed-title">Equipos</h1>

          <div className="ed-header-buttons">
            <button
              type="button"
              className="ed-new-button ed-new-button--pc"
              onClick={() => navigate("/devices/new")}
            >
              + Nuevo equipo
            </button>
          </div>
        </header>

        {/* Barra de búsqueda */}
        <section className="ed-search-row">
          <form
            className="ed-search-box"
            onSubmit={(e) => {
              e.preventDefault();
              loadDevices(); // refrescar desde el backend si quieres
            }}
          >
            <button
              type="submit"
              className="ed-search-icon-btn"
              aria-label="Buscar"
            >
              <span className="ed-search-icon">🔍</span>
            </button>

            <input
              className="ed-search-input"
              placeholder="Buscar código, marca, modelo, empresa…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {search && (
              <button
                type="button"
                className="ed-search-icon-btn"
                onClick={() => setSearch("")}
                aria-label="Limpiar búsqueda"
              >
                ✕
              </button>
            )}
          </form>

          {/* Botón de filtros (si luego quieres agregar filtros reales) */}
          <button
            type="button"
            className="ed-filter-btn"
            onClick={() => loadDevices()}
            title="Refrescar equipos"
          >
            ⟳
          </button>
        </section>

        {/* Estados de carga / error */}
        {loading && (
          <p className="ed-status-text">Cargando equipos…</p>
        )}

        {error && !loading && (
          <p className="ed-status-text ed-status-error">{error}</p>
        )}

        {!loading && !error && filteredDevices.length === 0 && (
          <p className="ed-status-text">
            No se encontraron equipos para la búsqueda actual.
          </p>
        )}

        {/* Lista de tarjetas */}
        {!loading && !error && filteredDevices.length > 0 && (
          <section className="ed-device-list">
            {filteredDevices.map((device) => (
              <article
                key={device.id}
                className="ed-device-card"
              >
                {/* IZQUIERDA: “imagen” del equipo */}
                <div className="ed-card-media">
                  {/* Si en el futuro tienes URL de imagen, reemplaza por <img className="ed-card-img" src={...} /> */}
                  <div className="ed-card-placeholder">
                    <strong>{getDeviceInitials(device)}</strong>
                  </div>
                </div>

                {/* DERECHA: contenido */}
                <div className="ed-card-content">
                  <div className="ed-info-grid">
                    {/* Columna 1 */}
                    <div className="ed-info-col">
                      <div className="ed-mini-card">
                        <span className="ed-mini-label">Código</span>
                        <span className="ed-mini-value">{device.id}</span>
                      </div>

                      <div className="ed-mini-card">
                        <span className="ed-mini-label">Marca</span>
                        <span className="ed-mini-value">
                          {device.brand || "—"}
                        </span>
                      </div>
                    </div>

                    {/* Columna 2 */}
                    <div className="ed-info-col">
                      <div className="ed-mini-card">
                        <span className="ed-mini-label">Modelo</span>
                        <span className="ed-mini-value">
                          {device.model || "—"}
                        </span>
                      </div>

                      <div className="ed-mini-card">
                        <span className="ed-mini-label">Propietario</span>
                        <span className="ed-mini-value">
                          {device.owner?.name ?? "—"}
                        </span>
                      </div>
                    </div>

                    {/* Columna 3 */}
                    <div className="ed-info-col">
                      <div className="ed-mini-card">
                        <span className="ed-mini-label">Tipo</span>
                        <div className="ed-tags-column">
                          <button
                            type="button"
                            className="ed-tag"
                          >
                            {formatType(device.type)}
                          </button>
                        </div>
                      </div>

                      <div className="ed-mini-card">
                        <span className="ed-mini-label">Ingreso</span>
                        <span className="ed-mini-value">
                          {formatDate(device.checkinAt)}
                        </span>
                      </div>

                      <div className="ed-mini-card">
                        <span className="ed-mini-label">Acciones</span>
                        <div className="ed-header-buttons">
                          <button
                            type="button"
                            className="dv-btn dv-btn-sm dv-btn-outline-secondary"
                            onClick={() =>
                              navigate(`/devices/${device.id}`)
                            }
                          >
                            Ver
                          </button>
                          <button
                            type="button"
                            className="dv-btn dv-btn-sm dv-btn-outline-primary"
                            onClick={() =>
                              navigate(`/devices/${device.id}/edit`)
                            }
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="dv-btn dv-btn-sm dv-btn-outline-secondary"
                            onClick={() =>
                              navigate(`/equipment/${device.id}/audits`)
                            }
                          >
                            Auditoría
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </section>
    </main>
  );
}
