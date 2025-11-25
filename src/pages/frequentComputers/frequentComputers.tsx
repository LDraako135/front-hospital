import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import "./frequentComputers.css";

type FrequentComputer = {
  id: string;
  brand: string;
  model: string;
  color: string | null;
  ownerName: string;
  ownerId: string;
  photoURL: string | null;
  checkinURL: string;
  checkoutURL: string;
};

type DeviceType = "computer" | "device";

export default function FrequentComputers() {
  const navigate = useNavigate();

  const [computers, setComputers] = useState<FrequentComputer[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<FrequentComputer | null>(null);
  const [deviceType, setDeviceType] = useState<DeviceType>("computer");

  const normalize = (text: string) =>
    text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/computers/frequent");
        if (!res.ok) throw new Error("Error al cargar frecuentes");

        const raw = await res.json();

        const mapped: FrequentComputer[] = raw.map((item: any) => {
          const d = item.device ?? {};

          return {
            id: d.id,
            brand: d.brand ?? "Sin marca",
            model: d.model ?? "Sin modelo",
            color: d.color ?? null,
            ownerName: d.owner?.name ?? "Usuario desconocido",
            ownerId: d.owner?.id ?? "—",
            photoURL: d.photoURL ?? null,
            checkinURL: item.checkinURL,
            checkoutURL: item.checkoutURL,
          };
        });

        setComputers(mapped);
        setSelected(mapped[0] ?? null);
      } catch (e) {
        console.error(e);
      }
    }

    load();
  }, []);

  const filtered = computers.filter((c) =>
    normalize(
      `${c.ownerName} ${c.brand} ${c.model} ${c.color ?? ""}`
    ).includes(normalize(search))
  );

  const appOrigin =
    typeof window !== "undefined" ? window.location.origin : "";

  const handleCreateNew = () => {
    if (deviceType === "computer") {
      // 👉 Crear nuevo ingreso de computador marcado como frecuente
      navigate("/computers/checkin?frequent=1");
    } else {
      // 👉 Crear nuevo ingreso de dispositivo biomédico (NO frecuente)
      navigate("/medical/checkin");
    }
  };

  return (
    <main className="md3-page">
      <section className="md3-card fd-card">
        <h1 className="fd-title">Dispositivos frecuentes</h1>

        {/* Selector tipo de dispositivo + botón crear */}
        <div className="fc-type-row">
          <div className="fc-type-toggle">
            <button
              type="button"
              className={`fc-type-btn ${
                deviceType === "computer" ? "fc-type-btn--active" : ""
              }`}
              onClick={() => setDeviceType("computer")}
            >
              Computador
            </button>
            <button
              type="button"
              className={`fc-type-btn ${
                deviceType === "device" ? "fc-type-btn--active" : ""
              }`}
              onClick={() => setDeviceType("device")}
            >
              Dispositivo biomédico
            </button>
          </div>

          <button type="button" className="fc-create-btn" onClick={handleCreateNew}>
            Crear ingreso nuevo
          </button>
        </div>

        {/* Buscador (solo tiene sentido para computadores frecuentes) */}
        {deviceType === "computer" && (
          <div className="fd-search-row">
            <div className="fc-search-box">
              <input
                className="fd-search-input"
                placeholder="Buscar…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="fc-icon-button">🔍</button>
            </div>
          </div>
        )}

        {/* Contenedor principal */}
        <div className="fc-main-grid">
          {/* Lista de usuarios (solo computadores frecuentes) */}
          {deviceType === "computer" && (
            <div className="fc-list">
              {filtered.map((c) => (
                <div
                  key={c.id}
                  className="fc-item"
                  onClick={() => setSelected(c)}
                  style={{
                    cursor: "pointer",
                    background: selected?.id === c.id ? "#ebe4ff" : "",
                    borderColor: selected?.id === c.id ? "#b9a5ff" : "",
                  }}
                >
                  <p className="fc-item-name">{c.ownerName}</p>
                  <p className="fc-item-desc">
                    {c.brand} {c.model} {c.color ? `(${c.color})` : ""}
                  </p>
                </div>
              ))}

              {filtered.length === 0 && (
                <p className="ed-status-text">
                  No hay computadores frecuentes registrados.
                </p>
              )}
            </div>
          )}

          {/* Mensaje para dispositivos biomédicos */}
          {deviceType === "device" && (
            <div className="fc-empty-devices">
              <p className="ed-status-text">
                Los dispositivos biomédicos no se manejan como frecuentes.
              </p>
              <p className="ed-status-text">
                Usa el botón <strong>“Crear ingreso nuevo”</strong> para
                registrar un ingreso biomédico.
              </p>
            </div>
          )}

          {/* QRs dinámicos SOLO para computadores frecuentes */}
          {deviceType === "computer" && selected && (
            <div className="fc-qrs">
              {/* QR ENTRADA */}
              <div className="fc-qr-block">
                <p className="fc-qr-title">QR ENTRADA</p>

                <div
                  style={{
                    background: "#fff",
                    padding: "12px",
                    borderRadius: "12px",
                  }}
                >
                  <QRCodeSVG
                    // cuando escaneen, abre ruta del FRONT que hace checkin frecuente
                    value={`${appOrigin}/frequent/qr/checkin/${selected.id}`}
                    size={180}
                  />
                </div>
              </div>

              {/* QR SALIDA */}
              <div className="fc-qr-block">
                <p className="fc-qr-title">QR SALIDA</p>

                <div
                  style={{
                    background: "#fff",
                    padding: "12px",
                    borderRadius: "12px",
                  }}
                >
                  <QRCodeSVG
                    // esta ruta del FRONT registra la salida
                    value={`${appOrigin}/frequent/qr/checkout/${selected.id}`}
                    size={180}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
