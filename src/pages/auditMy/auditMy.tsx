import { useEffect, useState } from "react";
import "./auditMy.css";

type MyAuditRow = {
  id: number | string;
  action: string;
  detail: string | null;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
};

const MY_AUDIT_URL = "/api/audit/me"; // ajusta a tu backend

export default function MyAuditPage() {
  const [rows, setRows] = useState<MyAuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRows();
  }, []);

  async function loadRows() {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(MY_AUDIT_URL, {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Error al cargar mi auditoría");
      }

      const data: MyAuditRow[] = await res.json();
      setRows(data);
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "Error al cargar mi auditoría");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="ma-page">
      <section className="ma-container">
        <header className="ma-header">
          <h1 className="ma-title">Mi actividad reciente</h1>
        </header>

        <section className="ma-table-section">
          {loading && <p>Cargando actividad…</p>}
          {error && !loading && (
            <p className="ma-error-text">{error}</p>
          )}

          {!loading && !error && (
            <div className="ma-table-wrapper">
              <table className="ma-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Acción</th>
                    <th>Detalle</th>
                    <th>IP</th>
                    <th>Agente</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center" }}>
                        Sin registros.
                      </td>
                    </tr>
                  )}

                  {rows.map((a) => (
                    <tr key={a.id}>
                      <td>{a.id}</td>
                      <td>
                        <span className="ma-badge">{a.action}</span>
                      </td>
                      <td>{a.detail ?? "-"}</td>
                      <td>{a.ip ?? "-"}</td>
                      <td>
                        <span className="ma-muted">
                          {a.userAgent ?? "-"}
                        </span>
                      </td>
                      <td>
                        <small>
                          {new Date(a.createdAt).toLocaleString("es-ES")}
                        </small>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
