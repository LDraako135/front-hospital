import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react"; // ✅ QR dinámicos
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

export default function FrequentComputers() {
  const [computers, setComputers] = useState<FrequentComputer[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<FrequentComputer | null>(null);

  const normalize = (text: string) =>
    text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/computers/frequent");
        if (!res.ok) throw new Error("Error al cargar frecuentes");

        const raw = await res.json();
        console.log("Frequent -> ", raw);

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
        setSelected(mapped[0] ?? null); // ✅ Seleccionar primero por defecto
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

  return (
    <main className="md3-page">
      <section className="md3-card fd-card">

        <h1 className="fd-title">Dispositivos frecuentes</h1>

        {/* Buscador */}
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

        {/* Contenedor principal */}
        <div className="fc-main-grid">

          {/* Lista de usuarios */}
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
          </div>

          {/* QRs dinámicos */}
          {selected && (
            <div className="fc-qrs">

              <div className="fc-qr-block">
                <p className="fc-qr-title">QR ENTRADA</p>

                <div style={{ background: "#fff", padding: "12px", borderRadius: "12px" }}>
                  <QRCodeSVG
                    value={selected.checkinURL}
                    size={180}
                  />
                </div>
              </div>

              <div className="fc-qr-block">
                <p className="fc-qr-title">QR SALIDA</p>

                <div style={{ background: "#fff", padding: "12px", borderRadius: "12px" }}>
                  <QRCodeSVG
                    value={selected.checkoutURL}
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
