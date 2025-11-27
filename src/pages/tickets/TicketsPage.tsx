// src/pages/tickets/TicketsPage.tsx
import { useEffect, useMemo, useState } from "react";
import "./tickets.css";

type TicketStatus = "OPEN" | "IN_PROGRESS" | "CLOSED";
type TicketPriority = "LOW" | "MEDIUM" | "HIGH";

type Ticket = {
  id: string;
  title: string;
  description: string;
  area: string;
  subarea?: string;
  deviceType?: "computer" | "medical";
  deviceId?: string;
  status: TicketStatus;
  priority: TicketPriority;
  requestedBy?: string;
  createdAt: string;
  updatedAt: string;
};

const normalize = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

const statusLabel: Record<TicketStatus, string> = {
  OPEN: "Abierto",
  IN_PROGRESS: "En progreso",
  CLOSED: "Cerrado",
};

const priorityLabel: Record<TicketPriority, string> = {
  LOW: "Baja",
  MEDIUM: "Media",
  HIGH: "Alta",
};

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all");
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    area: "",
    subarea: "",
    deviceType: "" as "" | "computer" | "medical",
    deviceId: "",
    priority: "MEDIUM" as TicketPriority,
    requestedBy: "",
  });

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/tickets"); // <- importante
      if (!res.ok) throw new Error("Error al cargar tickets");
      const data = await res.json();
      setTickets(data);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Error al cargar tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const filtered = useMemo(() => {
    let list = [...tickets];

    if (statusFilter !== "all") {
      list = list.filter((t) => t.status === statusFilter);
    }

    if (search) {
      const term = normalize(search);
      list = list.filter((t) =>
        normalize(
          `${t.title} ${t.description} ${t.area} ${t.subarea ?? ""} ${
            t.deviceId ?? ""
          } ${t.deviceType ?? ""} ${t.requestedBy ?? ""}`
        ).includes(term)
      );
    }

    return list;
  }, [tickets, search, statusFilter]);

  const handleChangeForm = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreate = async () => {
    if (!form.title.trim() || !form.area.trim() || !form.description.trim()) {
      alert("Título, área y descripción son obligatorios");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          deviceType: form.deviceType || undefined,
          deviceId: form.deviceId || undefined,
        }),
      });

      if (!res.ok) throw new Error("Error al crear ticket");

      setForm({
        title: "",
        description: "",
        area: "",
        subarea: "",
        deviceType: "",
        deviceId: "",
        priority: "MEDIUM",
        requestedBy: "",
      });
      setShowNew(false);
      await loadTickets();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Error al crear ticket");
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id: string, status: TicketStatus) => {
    try {
      setError(null);
      const res = await fetch(`/api/tickets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Error al actualizar ticket");
      await loadTickets();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Error al actualizar ticket");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Eliminar este ticket?")) return;
    try {
      setError(null);
      const res = await fetch(`/api/tickets/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar ticket");
      await loadTickets();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Error al eliminar ticket");
    }
  };

  return (
    <main className="ed-page">
      <div className="ed-container">
        {/* Header */}
        <header className="ed-header">
          <h1 className="ed-title">Tickets / Solicitudes</h1>
          <div className="ed-header-buttons">
            <button
              className="ed-new-button"
              onClick={() => setShowNew((s) => !s)}
            >
              {showNew ? "Cancelar" : "Nuevo ticket"}
            </button>
          </div>
        </header>

        {/* Buscar + Filtro estado */}
        <div className="ed-search-row">
          <div className="ed-search-box">
            <span className="ed-search-icon" aria-hidden>
              🔍
            </span>
            <input
              className="ed-search-input"
              placeholder="Buscar por título, área, descripción…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="tk-select"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as TicketStatus | "all")
            }
          >
            <option value="all">Todos los estados</option>
            <option value="OPEN">Abiertos</option>
            <option value="IN_PROGRESS">En progreso</option>
            <option value="CLOSED">Cerrados</option>
          </select>
        </div>

        {/* Formulario nuevo ticket */}
        {showNew && (
          <section className="tk-new-card">
            <h2 className="tk-new-title">Nuevo ticket</h2>
            <div className="tk-form-grid">
              <div className="tk-form-field">
                <label>Título*</label>
                <input
                  value={form.title}
                  onChange={(e) => handleChangeForm("title", e.target.value)}
                />
              </div>
              <div className="tk-form-field">
                <label>Área*</label>
                <input
                  value={form.area}
                  onChange={(e) => handleChangeForm("area", e.target.value)}
                />
              </div>
              <div className="tk-form-field">
                <label>Subárea</label>
                <input
                  value={form.subarea}
                  onChange={(e) =>
                    handleChangeForm("subarea", e.target.value)
                  }
                />
              </div>
              <div className="tk-form-field">
                <label>Prioridad</label>
                <select
                  value={form.priority}
                  onChange={(e) =>
                    handleChangeForm(
                      "priority",
                      e.target.value as TicketPriority
                    )
                  }
                >
                  <option value="LOW">Baja</option>
                  <option value="MEDIUM">Media</option>
                  <option value="HIGH">Alta</option>
                </select>
              </div>
              <div className="tk-form-field">
                <label>Tipo de dispositivo</label>
                <select
                  value={form.deviceType}
                  onChange={(e) =>
                    handleChangeForm(
                      "deviceType",
                      e.target.value as "" | "computer" | "medical"
                    )
                  }
                >
                  <option value="">Ninguno</option>
                  <option value="computer">Computador</option>
                  <option value="medical">Biomédico</option>
                </select>
              </div>
              <div className="tk-form-field">
                <label>ID del dispositivo</label>
                <input
                  value={form.deviceId}
                  onChange={(e) =>
                    handleChangeForm("deviceId", e.target.value)
                  }
                />
              </div>
              <div className="tk-form-field tk-form-field-full">
                <label>Descripción*</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    handleChangeForm("description", e.target.value)
                  }
                />
              </div>
              <div className="tk-form-field tk-form-field-full">
                <label>Solicitado por</label>
                <input
                  value={form.requestedBy}
                  onChange={(e) =>
                    handleChangeForm("requestedBy", e.target.value)
                  }
                />
              </div>
            </div>
            <div className="tk-new-actions">
              <button
                className="btn-secondary"
                onClick={() => setShowNew(false)}
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                className="btn-primary"
                onClick={handleCreate}
                disabled={saving}
              >
                {saving ? "Guardando…" : "Crear ticket"}
              </button>
            </div>
          </section>
        )}

        {/* Estados */}
        {loading && <p className="ed-status-text">Cargando tickets…</p>}
        {error && !loading && (
          <p className="ed-status-text ed-status-error">{error}</p>
        )}
        {!loading && !error && filtered.length === 0 && (
          <p className="ed-status-text">No hay tickets registrados.</p>
        )}

        {/* Lista de tickets */}
        {!loading && !error && filtered.length > 0 && (
          <section className="tk-list">
            {filtered.map((t) => {
              const created = new Date(t.createdAt);
              const createdText = isNaN(created.getTime())
                ? t.createdAt
                : `${created.toLocaleDateString(
                    "es-ES"
                  )} ${created.toLocaleTimeString("es-ES", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`;

              return (
                <article key={t.id} className="tk-card">
                  <div className="tk-card-header">
                    <div>
                      <h2 className="tk-card-title">{t.title}</h2>
                      <div className="tk-card-meta">
                        <span>{t.area}</span>
                        {t.subarea && <span> · {t.subarea}</span>}
                      </div>
                    </div>
                    <div className="tk-card-badges">
                      <span
                        className={
                          "tk-badge tk-badge-status tk-badge-status--" +
                          t.status.toLowerCase()
                        }
                      >
                        {statusLabel[t.status]}
                      </span>
                      <span
                        className={
                          "tk-badge tk-badge-priority tk-badge-priority--" +
                          t.priority.toLowerCase()
                        }
                      >
                        {priorityLabel[t.priority]}
                      </span>
                    </div>
                  </div>

                  <p className="tk-card-description">{t.description}</p>

                  <div className="tk-card-info-row">
                    <div className="tk-card-info-col">
                      <span className="tk-info-label">Dispositivo</span>
                      <span className="tk-info-value">
                        {t.deviceType
                          ? t.deviceType === "computer"
                            ? "Computador"
                            : "Biomédico"
                          : "Ninguno"}
                        {t.deviceId ? ` · ID: ${t.deviceId}` : ""}
                      </span>
                    </div>
                    <div className="tk-card-info-col">
                      <span className="tk-info-label">Solicitante</span>
                      <span className="tk-info-value">
                        {t.requestedBy || "No especificado"}
                      </span>
                    </div>
                    <div className="tk-card-info-col">
                      <span className="tk-info-label">Creado</span>
                      <span className="tk-info-value">{createdText}</span>
                    </div>
                  </div>

                  <div className="tk-card-actions">
                    {t.status !== "OPEN" && (
                      <button
                        className="ed-action-btn ed-action-btn--edit"
                        onClick={() => updateStatus(t.id, "OPEN")}
                      >
                        Marcar abierto
                      </button>
                    )}
                    {t.status !== "IN_PROGRESS" && (
                      <button
                        className="ed-action-btn ed-action-btn--edit"
                        onClick={() => updateStatus(t.id, "IN_PROGRESS")}
                      >
                        En progreso
                      </button>
                    )}
                    {t.status !== "CLOSED" && (
                      <button
                        className="ed-action-btn ed-action-btn--edit"
                        onClick={() => updateStatus(t.id, "CLOSED")}
                      >
                        Cerrar
                      </button>
                    )}
                    <button
                      className="ed-action-btn ed-action-btn--delete"
                      onClick={() => handleDelete(t.id)}
                    >
                      Eliminar
                    </button>
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
