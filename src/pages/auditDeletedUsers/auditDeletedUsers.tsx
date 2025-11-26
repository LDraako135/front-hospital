import { useEffect, useState } from "react";
import "./auditDeletedUsers.css";

type DeletedUserAuditRow = {
  id: number | string;
  username: string;
  email: string;
  role: string;
  actorUsername: string | null;
  ip: string | null;
  userAgent: string | null;
  deletedAt: string;
};

const DELETED_AUDIT_URL = "/api/audit/users/deleted"; // ajusta a tu backend

export default function DeletedUsersAuditPage() {
  const [rows, setRows] = useState<DeletedUserAuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadRows();
  }, []);

  async function loadRows() {
    try {
      setLoading(true);
      setError(null);

      const url = new URL(DELETED_AUDIT_URL, window.location.origin);
      if (search.trim()) {
        url.searchParams.set("q", search.trim());
      }

      const res = await fetch(url.toString(), {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Error al cargar auditoría de eliminaciones");
      }

      const data: DeletedUserAuditRow[] = await res.json();
      setRows(data);
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "Error al cargar auditoría");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="dua-page">
      <section className="dua-container">
        <header className="dua-header">
          <h1 className="dua-title">Auditoría de usuarios eliminados</h1>

          <form
            className="dua-search-form"
            onSubmit={(e) => {
              e.preventDefault();
              loadRows();
            }}
          >
            <input
              className="dua-search-input"
              placeholder="Buscar por usuario/actor/email/rol/IP/UA"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="dua-search-buttons">
              <button
                type="submit"
                className="dua-btn dua-btn-outline-primary"
              >
                Buscar
              </button>
              <button
                type="button"
                className="dua-btn dua-btn-outline-danger"
                onClick={() => {
                  setSearch("");
                  loadRows();
                }}
              >
                Limpiar
              </button>
            </div>
          </form>
        </header>

        <section className="dua-table-section">
          {loading && <p>Cargando registros…</p>}
          {error && !loading && (
            <p className="dua-error-text">{error}</p>
          )}

          {!loading && !error && (
            <div className="dua-table-wrapper">
              <table className="dua-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Usuario eliminado</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Actor</th>
                    <th>IP</th>
                    <th>Agente</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ textAlign: "center" }}>
                        Sin registros.
                      </td>
                    </tr>
                  )}

                  {rows.map((r) => (
                    <tr key={r.id}>
                      <td>{r.id}</td>
                      <td>{r.username}</td>
                      <td>{r.email}</td>
                      <td>
                        <span className="dua-badge">{r.role}</span>
                      </td>
                      <td>{r.actorUsername ?? "—"}</td>
                      <td>{r.ip ?? "-"}</td>
                      <td>
                        <span className="dua-muted">
                          {r.userAgent ?? "-"}
                        </span>
                      </td>
                      <td>
                        <small>
                          {new Date(r.deletedAt).toLocaleString("es-ES")}
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
