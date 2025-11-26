// src/pages/audit/AuditPage.tsx
import { useEffect, useMemo, useState } from "react";
import "./audit.css";

type AuditAction = "CREATE" | "UPDATE" | "DELETE";
type AuditKind = "computer" | "medical";

type AuditEvent = {
  id: string;
  action: AuditAction;
  kind: AuditKind;
  deviceId: string;
  brand?: string;
  model?: string;
  userName?: string;
  userId?: string;
  timestamp: string; // ISO
};

const normalize = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

const actionLabel: Record<AuditAction, string> = {
  CREATE: "Creación",
  UPDATE: "Actualización",
  DELETE: "Eliminación",
};

export default function AuditPage() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

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
        }));

        mapped.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() -
            new Date(a.timestamp).getTime()
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
    if (!search) return events;
    const term = normalize(search);

    return events.filter((e) =>
      normalize(
        `${e.userName ?? ""} ${e.brand ?? ""} ${e.model ?? ""} ${
          e.action
        } ${e.kind}`
      ).includes(term)
    );
  }, [events, search]);

  return (
    <main className="md3-page">
      <section className="md3-card audit-card">
        <h1 className="audit-title">Auditoría</h1>

        <div className="audit-search-row">
          <input
            className="audit-search-input"
            placeholder="Buscar por usuario, equipo, acción…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading && <p className="ed-status-text">Cargando auditoría…</p>}
        {error && !loading && (
          <p className="ed-status-text ed-status-error">{error}</p>
        )}

        {!loading && !error && filtered.length === 0 && (
          <p className="ed-status-text">No hay registros de auditoría.</p>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="audit-table">
            <div className="audit-table-header">
              <span>Fecha/Hora</span>
              <span>Acción</span>
              <span>Tipo</span>
              <span>Equipo</span>
              <span>Usuario</span>
            </div>

            {filtered.map((e) => {
              const date = new Date(e.timestamp);
              const dateText = isNaN(date.getTime())
                ? e.timestamp
                : `${date.toLocaleDateString("es-ES")} ${date.toLocaleTimeString(
                    "es-ES",
                    { hour: "2-digit", minute: "2-digit" }
                  )}`;

              return (
                <div key={e.id} className="audit-table-row">
                  <span>{dateText}</span>
                  <span
                    className={`audit-badge audit-badge--${e.action.toLowerCase()}`}
                  >
                    {actionLabel[e.action]}
                  </span>
                  <span>
                    {e.kind === "medical" ? "Biomédico" : "Computador"}
                  </span>
                  <span>
                    {e.brand} {e.model}
                  </span>
                  <span>
                    {e.userName} {e.userId ? `(${e.userId})` : ""}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
