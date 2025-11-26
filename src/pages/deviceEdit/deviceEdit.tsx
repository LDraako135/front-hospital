import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./deviceEdit.css";

type DeviceEditForm = {
  brand: string;
  model: string;
  userName: string;
  userId: string | null;
  color: string | null;
  serial: string | null;
};

type DeviceApi = {
  id: string;
  kind: "computer" | "medical" | "frequent-computer";
  brand: string;
  model: string;
  owner: { id: string | null; name: string };
  color: string | null;
  serial: string | null;
};

export default function DeviceEditPage() {
  const { deviceId } = useParams<{ deviceId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<DeviceEditForm>({
    brand: "",
    model: "",
    userName: "",
    userId: null,
    color: null,
    serial: null,
  });

  useEffect(() => {
    if (!deviceId) return;
    loadDevice(deviceId);
  }, [deviceId]);

  async function loadDevice(id: string) {
    try {
      setLoading(true);
      setError(null);

      // 1) Intentar leer de sessionStorage (si vienes desde DeviceDetail)
      const stored = sessionStorage.getItem("selectedDevice");
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as any;
          if (parsed.id === id) {
            setForm({
              brand: parsed.brand,
              model: parsed.model,
              userName: parsed.userName,
              userId: parsed.userId,
              color: parsed.color,
              serial: parsed.serial,
            });
            setLoading(false);
            return;
          }
        } catch {
          // ignoramos y seguimos
        }
      }

      // 2) Si no está en sessionStorage, pedirlo a la API
      const res = await fetch(`/api/devices/${id}`, {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("No se pudo cargar el dispositivo");
      }

      const data: DeviceApi = await res.json();
      setForm({
        brand: data.brand,
        model: data.model,
        userName: data.owner.name,
        userId: data.owner.id,
        color: data.color,
        serial: data.serial,
      });
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "Error al cargar dispositivo");
    } finally {
      setLoading(false);
    }
  }

  function handleChange<K extends keyof DeviceEditForm>(
    field: K,
    value: DeviceEditForm[K]
  ) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!deviceId) return;

    if (!form.brand || !form.model || !form.userName) {
      alert("Marca, modelo y nombre del usuario son obligatorios.");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const res = await fetch(`/api/devices/${deviceId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          brand: form.brand,
          model: form.model,
          userName: form.userName,
          userId: form.userId,
          color: form.color,
          serial: form.serial,
        }),
      });

      if (!res.ok) {
        throw new Error("No se pudo actualizar el dispositivo");
      }

      alert("Dispositivo actualizado correctamente");
      navigate("/devices/entered");
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "Error al actualizar dispositivo");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deviceId) return;
    const confirmDelete = window.confirm(
      "¿Seguro que quieres eliminar este dispositivo? Esta acción no se puede deshacer."
    );
    if (!confirmDelete) return;

    try {
      setSaving(true);
      setError(null);

      const res = await fetch(`/api/devices/${deviceId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("No se pudo eliminar el dispositivo");
      }

      alert("Dispositivo eliminado");
      navigate("/devices/entered");
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "Error al eliminar dispositivo");
    } finally {
      setSaving(false);
    }
  }

  if (!deviceId) {
    return (
      <main className="de-page">
        <section className="de-container">
          <h1>Dispositivo no especificado</h1>
        </section>
      </main>
    );
  }

  return (
    <main className="de-page">
      <section className="de-container">
        <header className="de-header">
          <button
            type="button"
            className="de-back-btn"
            onClick={() => navigate(-1)}
          >
            ⬅ Volver
          </button>
          <h1 className="de-title">Editar dispositivo #{deviceId}</h1>
        </header>

        {loading && <p>Cargando datos del dispositivo…</p>}
        {error && !loading && <p className="de-error">{error}</p>}

        {!loading && !error && (
          <form className="de-form" onSubmit={handleSubmit}>
            <div className="de-form-row">
              <label>Marca</label>
              <input
                type="text"
                value={form.brand}
                onChange={(e) => handleChange("brand", e.target.value)}
                required
              />
            </div>

            <div className="de-form-row">
              <label>Modelo</label>
              <input
                type="text"
                value={form.model}
                onChange={(e) => handleChange("model", e.target.value)}
                required
              />
            </div>

            <div className="de-form-row">
              <label>Usuario</label>
              <input
                type="text"
                value={form.userName}
                onChange={(e) => handleChange("userName", e.target.value)}
                required
              />
            </div>

            <div className="de-form-row">
              <label>ID usuario (opcional)</label>
              <input
                type="text"
                value={form.userId ?? ""}
                onChange={(e) => handleChange("userId", e.target.value || null)}
              />
            </div>

            <div className="de-form-row">
              <label>Color</label>
              <input
                type="text"
                value={form.color ?? ""}
                onChange={(e) => handleChange("color", e.target.value || null)}
              />
            </div>

            <div className="de-form-row">
              <label>Serial</label>
              <input
                type="text"
                value={form.serial ?? ""}
                onChange={(e) => handleChange("serial", e.target.value || null)}
              />
            </div>

            <div className="de-actions">
              <button
                type="submit"
                className="de-btn de-btn-primary"
                disabled={saving}
              >
                {saving ? "Guardando…" : "Guardar cambios"}
              </button>

              <button
                type="button"
                className="de-btn de-btn-danger"
                onClick={handleDelete}
                disabled={saving}
              >
                Eliminar dispositivo
              </button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}
