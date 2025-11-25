import { useEffect, useState } from "react";
import "./frequentComputers.css";

type computerItem = {
  id: string;
  name: string;
  description: string;
};

export default function FrequentComputers() {
  const [computers, setcomputers] = useState<computerItem[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setcomputers([
      { id: "1", name: "User1", description: "Supporting line text lorem ipsum dolor sit amet." },
      { id: "2", name: "User2", description: "Supporting line text lorem ipsum dolor sit amet." },
      { id: "3", name: "User3", description: "Supporting line text lorem ipsum dolor sit amet." },
      { id: "4", name: "User4", description: "Supporting line text lorem ipsum dolor sit amet." },
    ]);
  }, []);

  const filtered = computers.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="md3-page">

      {/* CARD PRINCIPAL */}
      <section className="md3-card fd-card">

        <h1 className="fd-title">Dispositivos frecuentes</h1>

        {/* BUSCADOR */}
        <div className="fd-search-row">
          <div className="fd-search-box">
            <span className="material-symbols-outlined fd-search-icon"></span>
            <input
              className="fd-search-input"
              placeholder="Buscar…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* CONTENIDO EN 2 COLUMNAS */}
        <div className="fd-grid">

          {/* TABLA IZQUIERDA */}
          <div className="fd-table-wrapper">
            <table className="fd-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Descripción</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* QR DERECHA */}
          <div className="fd-qrs">
            <div className="fd-qr-block">
              <p className="fd-qr-title">QR ENTRADA</p>
              <img src="/qr-entry.png" className="fd-qr-img" />
            </div>

            <div className="fd-qr-block">
              <p className="fd-qr-title">QR SALIDA</p>
              <img src="/qr-exit.png" className="fd-qr-img" />
            </div>
          </div>

        </div>

      </section>

    </main>
  );
}
 