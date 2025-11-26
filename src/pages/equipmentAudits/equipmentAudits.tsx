import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./equipmentAudits.css";

type EquipmentAudit = {
  id: string; // 👈 ahora string
  equipmentId: number;
  actorUserId: number | null;
  action: string;
  detail: string | null;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
};

type EquipmentDeletion = {
  id: string; // 👈 ahora string
  equipmentId: number;
  internalCode: string | null;
  equipmentType: string | null;
  brand: string | null;
  model: string | null;
  serial: string | null;
  externalCompanyName: string | null;
  deliveryResponsibleName: string | null;
  status: string | null;
  checkinAt: string | null;
  checkoutAt: string | null;
  authorizedByUserId: number | null;
  notes: string | null;
  actorUserId: number | null;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
};

export default function EquipmentAuditsPage() {
  const { equipmentId } = useParams<{ equipmentId: string }>();
  const navigate = useNavigate();

  const [audits, setAudits] = useState<EquipmentAudit[]>([]);
  const [deletions, setDeletions] = useState<EquipmentDeletion[]>([]);
  const [loadingAudits, setLoadingAudits] = useState(true);
  const [loadingDeletions, setLoadingDeletions] = useState(true);
  const [errorAudits, setErrorAudits] = useState<string | null>(null);
  const [errorDeletions, setErrorDeletions] = useState<string | null>(null);

  useEffect(() => {
    if (!equipmentId) return;
    loadAudits(equipmentId);
    loadDeletions(equipmentId);
  }, [equipmentId]);

  async function loadAudits(id: string) {
    try {
      setLoadingAudits(true);
      setErrorAudits(null);

      const res = await fetch(
        `/api/equipment/audits?equipmentId=${encodeURIComponent(id)}`,
        {
          credentials: "include",
        }
      );

      if (!res.ok) {
        throw new Error("Error al cargar auditoría");
      }

      const data: EquipmentAudit[] = await res.json();
      setAudits(data);
    } catch (err: any) {
      console.error(err);
      setErrorAudits(err?.message ?? "Error al cargar auditoría");
    } finally {
      setLoadingAudits(false);
    }
  }

  async function loadDeletions(id: string) {
    try {
      setLoadingDeletions(true);
      setErrorDeletions(null);

      const res = await fetch(
        `/api/equipment/deletions?equipmentId=${encodeURIComponent(id)}`,
        {
          credentials: "include",
        }
      );

      if (!res.ok) {
        throw new Error("Error al cargar eliminaciones");
      }

      const data: EquipmentDeletion[] = await res.json();
      setDeletions(data);
    } catch (err: any) {
      console.error(err);
      setErrorDeletions(err?.message ?? "Error al cargar eliminaciones");
    } finally {
      setLoadingDeletions(false);
    }
  }

  return (
    <main className="ea-page">
      <section className="ea-container">
        <header className="ea-header">
          <button
            type="button"
            className="ea-back-button"
            onClick={() => navigate(-1)}
          >
            ⬅ Volver
          </button>
          <h1 className="ea-title">Auditoría de equipo #{equipmentId}</h1>
        </header>

        {/* AUDITORÍA */}
        <section className="ea-section">
          <h2 className="ea-section-title">Auditoría</h2>

          {loadingAudits && <p>Cargando auditoría…</p>}
          {errorAudits && !loadingAudits && (
            <p className="ea-error-text">{errorAudits}</p>
          )}

          {!loadingAudits && !errorAudits && (
            <div className="ea-table-wrapper">
              <table className="ea-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Acción</th>
                    <th>Detalle</th>
                    <th>IP</th>
                    <th>Actor</th>
                    <th>Agente</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {audits.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center" }}>
                        Sin registros de auditoría.
                      </td>
                    </tr>
                  )}

                  {audits.map((a) => (
                    <tr key={a.id}>
                      <td>{a.id}</td>
                      <td>
                        <span className="ea-badge">{a.action}</span>
                      </td>
                      <td>{a.detail ?? "-"}</td>
                      <td>{a.ip ?? "-"}</td>
                      <td>{a.actorUserId ?? "-"}</td>
                      <td>
                        <small className="ea-muted">
                          {a.userAgent ?? "-"}
                        </small>
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

        {/* ELIMINACIONES */}
        <section className="ea-section">
          <h2 className="ea-section-title">Eliminaciones / snapshots</h2>

          {loadingDeletions && <p>Cargando eliminaciones…</p>}
          {errorDeletions && !loadingDeletions && (
            <p className="ea-error-text">{errorDeletions}</p>
          )}

          {!loadingDeletions && !errorDeletions && (
            <div className="ea-table-wrapper">
              <table className="ea-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Código interno</th>
                    <th>Tipo</th>
                    <th>Marca</th>
                    <th>Modelo</th>
                    <th>Serial</th>
                    <th>Empresa externa</th>
                    <th>Responsable entrega</th>
                    <th>Estado</th>
                    <th>Ingreso</th>
                    <th>Salida</th>
                    <th>Notas</th>
                    <th>Actor</th>
                    <th>IP</th>
                    <th>Fecha registro</th>
                  </tr>
                </thead>
                <tbody>
                  {deletions.length === 0 && (
                    <tr>
                      <td colSpan={15} style={{ textAlign: "center" }}>
                        Sin eliminaciones registradas.
                      </td>
                    </tr>
                  )}

                  {deletions.map((d) => (
                    <tr key={d.id}>
                      <td>{d.id}</td>
                      <td>{d.internalCode ?? "-"}</td>
                      <td>{d.equipmentType ?? "-"}</td>
                      <td>{d.brand ?? "-"}</td>
                      <td>{d.model ?? "-"}</td>
                      <td>{d.serial ?? "-"}</td>
                      <td>{d.externalCompanyName ?? "-"}</td>
                      <td>{d.deliveryResponsibleName ?? "-"}</td>
                      <td>{d.status ?? "-"}</td>
                      <td>
                        {d.checkinAt
                          ? new Date(d.checkinAt).toLocaleDateString("es-ES")
                          : "-"}
                      </td>
                      <td>
                        {d.checkoutAt
                          ? new Date(d.checkoutAt).toLocaleDateString("es-ES")
                          : "-"}
                      </td>
                      <td>{d.notes ?? "-"}</td>
                      <td>{d.actorUserId ?? "-"}</td>
                      <td>{d.ip ?? "-"}</td>
                      <td>
                        {new Date(d.createdAt).toLocaleString("es-ES")}
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
