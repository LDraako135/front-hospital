import { useEffect, useMemo, useState } from "react";
import "./audit.css";

type AuditAction = "CREATE" | "UPDATE" | "DELETE";
type AuditKind = "computer" | "medical" | "ticket";

type AuditEvent = {
  id: string;
  action: AuditAction;
  kind: AuditKind;
  deviceId: string;

  // Para computer / medical
  brand?: string;
  model?: string;

  // Para ticket
  ticketTitle?: string;
  area?: string;
  subarea?: string;
  status?: string;
  priority?: string;

  // Usuario
  userName?: string;
  userId?: string | null;

  timestamp: string; // ISO
};

const normalize = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

const actionLabel: Record<AuditAction, string> = {
  CREATE: "Creación",
  UPDATE: "Actualización",
  DELETE: "Eliminación",
};

const kindLabel: Record<AuditKind, string> = {
  computer: "Computador",
  medical: "Biomédico",
  ticket: "Ticket / Solicitud",
};

export default function AuditPage() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [kindFilter, setKindFilter] = useState<AuditKind | "all">("all");
  const [actionFilter, setActionFilter] = useState<AuditAction | "all">("all");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/audit");
        if (!res.ok) throw new Error("Error al cargar auditoría");

        const data = await res.json();

        const mapped: AuditEvent[] = data.map((e: any) => ({
          id: String(e.id),
          action: e.action,
          kind: e.kind,
          deviceId: String(e.deviceId),
          brand: e.brand,
          model: e.model,
          userName: e.userName,
          userId: e.userId,
          timestamp: e.timestamp,
          ticketTitle: e.ticketTitle,
          area: e.area,
          subarea: e.subarea,
          status: e.status,
          priority: e.priority,
        }));

        mapped.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        setEvents(mapped);
      } catch (err: any) {
        console.error(err);
        setError(err?.message || "Error al cargar auditoría");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filtered = useMemo(() => {
    let list = [...events];

    if (kindFilter !== "all") {
      list = list.filter((e) => e.kind === kindFilter);
    }

    if (actionFilter !== "all") {
      list = list.filter((e) => e.action === actionFilter);
    }

    if (search) {
      const term = normalize(search);
      list = list.filter((e) =>
        normalize(
          `${e.userName ?? ""} ${e.userId ?? ""} ${e.brand ?? ""} ${
            e.model ?? ""
          } ${e.ticketTitle ?? ""} ${e.area ?? ""} ${e.subarea ?? ""} ${
            e.status ?? ""
          } ${e.priority ?? ""} ${e.action} ${e.kind}`
        ).includes(term)
      );
    }

    return list;
  }, [events, search, kindFilter, actionFilter]);

  return (
    <main className="ed-page">
      <div className="ed-container">
        {/* Header */}
        <header className="ed-header">
          <h1 className="ed-title">Auditoría</h1>
        </header>

        {/* Buscador */}
        <div className="ed-search-row">
          <div className="ed-search-box">
            <span className="ed-search-icon" aria-hidden>
              🔍
            </span>
            <input
              className="ed-search-input"
              placeholder="Buscar por usuario, equipo, ticket, área…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Filtros */}
        <div className="audit-filters">
          <div className="audit-filter-group">
            <span className="audit-filter-label">Tipo</span>
            <div className="audit-filter-chips">
              <button
                className={
                  "audit-chip" + (kindFilter === "all" ? " audit-chip--active" : "")
                }
                onClick={() => setKindFilter("all")}
              >
                Todos
              </button>
              <button
                className={
                  "audit-chip" +
                  (kindFilter === "computer" ? " audit-chip--active" : "")
                }
                onClick={() => setKindFilter("computer")}
              >
                Computadores
              </button>
              <button
                className={
                  "audit-chip" +
                  (kindFilter === "medical" ? " audit-chip--active" : "")
                }
                onClick={() => setKindFilter("medical")}
              >
                Biomédicos
              </button>
              <button
                className={
                  "audit-chip" +
                  (kindFilter === "ticket" ? " audit-chip--active" : "")
                }
                onClick={() => setKindFilter("ticket")}
              >
                Tickets
              </button>
            </div>
          </div>

          <div className="audit-filter-group">
            <span className="audit-filter-label">Acción</span>
            <div className="audit-filter-chips">
              <button
                className={
                  "audit-chip" +
                  (actionFilter === "all" ? " audit-chip--active" : "")
                }
                onClick={() => setActionFilter("all")}
              >
                Todas
              </button>
              <button
                className={
                  "audit-chip" +
                  (actionFilter === "CREATE" ? " audit-chip--active" : "")
                }
                onClick={() => setActionFilter("CREATE")}
              >
                Creación
              </button>
              <button
                className={
                  "audit-chip" +
                  (actionFilter === "UPDATE" ? " audit-chip--active" : "")
                }
                onClick={() => setActionFilter("UPDATE")}
              >
                Actualización
              </button>
              <button
                className={
                  "audit-chip" +
                  (actionFilter === "DELETE" ? " audit-chip--active" : "")
                }
                onClick={() => setActionFilter("DELETE")}
              >
                Eliminación
              </button>
            </div>
          </div>
        </div>

        {/* Estados */}
        {loading && <p className="ed-status-text">Cargando auditoría…</p>}
        {error && !loading && (
          <p className="ed-status-text ed-status-error">{error}</p>
        )}
        {!loading && !error && filtered.length === 0 && (
          <p className="ed-status-text">No hay registros de auditoría.</p>
        )}

        {/* Lista de eventos */}
        {!loading && !error && filtered.length > 0 && (
          <section className="audit-list">
            {filtered.map((e) => {
              const date = new Date(e.timestamp);
              const dateText = isNaN(date.getTime())
                ? e.timestamp
                : `${date.toLocaleDateString("es-ES")} ${date.toLocaleTimeString(
                    "es-ES",
                    { hour: "2-digit", minute: "2-digit" }
                  )}`;

              const isTicket = e.kind === "ticket";

              const mainLabel = isTicket
                ? e.ticketTitle || "(Sin título)"
                : `${e.brand ?? ""} ${e.model ?? ""}`.trim() || "—";

              const secondaryLabel = isTicket
                ? [
                    e.area ? `Área: ${e.area}` : "",
                    e.subarea ? `Subárea: ${e.subarea}` : "",
                    e.status ? `Estado: ${e.status}` : "",
                    e.priority ? `Prioridad: ${e.priority}` : "",
                  ]
                    .filter(Boolean)
                    .join(" · ")
                : e.deviceId
                ? `ID equipo: ${e.deviceId}`
                : "";

              const userLabel =
                (e.userName || "").trim() +
                (e.userId ? ` (${e.userId})` : "");

              return (
                <article key={e.id} className="audit-row-card">
                  <div className="audit-row-left">
                    <div className="audit-row-date">{dateText}</div>
                    <div
                      className={`audit-badge audit-badge--${e.action.toLowerCase()}`}
                    >
                      {actionLabel[e.action]}
                    </div>
                  </div>

                  <div className="audit-row-main">
                    <div className="audit-row-kind">
                      {kindLabel[e.kind] || e.kind}
                    </div>
                    <div className="audit-row-title">{mainLabel}</div>
                    {secondaryLabel && (
                      <div className="audit-row-subtitle">{secondaryLabel}</div>
                    )}
                  </div>

                  <div className="audit-row-user">
                    <span className="audit-row-user-label">Usuario</span>
                    <span className="audit-row-user-value">
                      {userLabel || "—"}
                    </span>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}
