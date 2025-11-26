// src/pages/deviceEdit/DeviceEdit.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logAudit } from "../../utils/audit"; // ajusta la ruta si tu estructura es distinta
/* import "./deviceEdit.css"; */

type DeviceKind = "computer" | "medical";

type DeviceCard = {
  id: string;
  kind: DeviceKind;
  brand: string;
  model: string;
  userName: string;
  userId: string | null;
  color: string | null;   // solo computadores
  serial: string | null;  // solo biomédicos
  entryTime: string;
  exitTime: string | null;
  photoUrl: string | null;
  isFrequent: boolean;
};

export default function DeviceEdit() {
  const navigate = useNavigate();
  const [device, setDevice] = useState<DeviceCard | null>(null);
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [color, setColor] = useState("");
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [serial, setSerial] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("selectedDevice");
    if (!stored) {
      navigate("/devices/entered");
      return;
    }
    try {
      const d = JSON.parse(stored) as DeviceCard;
      setDevice(d);

      setBrand(d.brand ?? "");
      setModel(d.model ?? "");
      setUserName(d.userName ?? "");
      setUserId(d.userId ?? "");

      // computador → color; biomédico → serial
      setColor(d.color ?? "");
      setSerial(d.serial ?? "");
    } catch {
      navigate("/devices/entered");
    }
  }, [navigate]);

  if (!device) {
    return (
      <main className="md3-page">
        <section className="md3-card">
          <p>No se encontró dispositivo para editar.</p>
          <button onClick={() => navigate("/devices/entered")}>Volver</button>
        </section>
      </main>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const endpoint =
        device.kind === "medical"
          ? `/api/medicaldevices/${device.id}`
          : `/api/computers/${device.id}`;

      const common = {
        brand: brand.trim(),
        model: model.trim(),
        ownerName: userName.trim(),
        ownerId: userId.trim(),
      };

      // 🔹 computador → color, biomédico → serial
      const body =
        device.kind === "computer"
          ? {
              ...common,
              color: color.trim() || null,
              serial: null,
            }
          : {
              ...common,
              color: null,
              serial: serial.trim() || null,
            };

      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error("Error al actualizar el dispositivo");
      }

      const updatedDevice: DeviceCard =
        device.kind === "computer"
          ? {
              ...device,
              brand: body.brand,
              model: body.model,
              color: body.color,
              serial: null,
              userName: body.ownerName,
              userId: body.ownerId,
            }
          : {
              ...device,
              brand: body.brand,
              model: body.model,
              color: null,
              serial: body.serial,
              userName: body.ownerName,
              userId: body.ownerId,
            };

      sessionStorage.setItem("selectedDevice", JSON.stringify(updatedDevice));

      // Auditoría UPDATE
      await logAudit("UPDATE", {
        id: updatedDevice.id,
        kind: updatedDevice.kind,
        brand: updatedDevice.brand,
        model: updatedDevice.model,
        userName: updatedDevice.userName,
        userId: updatedDevice.userId,
      });

      alert("Dispositivo actualizado correctamente.");
      navigate("/devices/entered");
    } catch (err) {
      console.error(err);
      alert("Error al actualizar el dispositivo.");
    } finally {
      setSaving(false);
    }
  }

  const isComputer = device.kind === "computer";
  const isMedical = device.kind === "medical";

  return (
    <main className="md3-page">
      <form onSubmit={handleSubmit} className="md3-card">
        <h2 className="md3-title">
          Editar {isMedical ? "Dispositivo biomédico" : "Computador"}
        </h2>

        <div className="md3-fields">
          <div className="md3-field-row">
            <div className="md3-field">
              <label className="md3-field-label">Marca</label>
              <div className="md3-textfield">
                <input
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="md3-textfield-input"
                  placeholder="Marca"
                />
              </div>
            </div>

            <div className="md3-field">
              <label className="md3-field-label">Modelo</label>
              <div className="md3-textfield">
                <input
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="md3-textfield-input"
                  placeholder="Modelo"
                />
              </div>
            </div>
          </div>

          <div className="md3-field-row">
            {/* Solo computador: color */}
            {isComputer && (
              <div className="md3-field">
                <label className="md3-field-label">Color</label>
                <div className="md3-textfield">
                  <input
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="md3-textfield-input"
                    placeholder="Color"
                  />
                </div>
              </div>
            )}

            {/* Solo biomédico: serial */}
            {isMedical && (
              <div className="md3-field">
                <label className="md3-field-label">Serial</label>
                <div className="md3-textfield">
                  <input
                    value={serial}
                    onChange={(e) => setSerial(e.target.value)}
                    className="md3-textfield-input"
                    placeholder="Serial"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="md3-field-row">
            <div className="md3-field">
              <label className="md3-field-label">Usuario</label>
              <div className="md3-textfield">
                <input
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="md3-textfield-input"
                  placeholder="Nombre usuario"
                />
              </div>
            </div>

            <div className="md3-field">
              <label className="md3-field-label">Identificación</label>
              <div className="md3-textfield">
                <input
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="md3-textfield-input"
                  placeholder="Documento"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="md3-card-actions">
          <button
            type="button"
            className="md3-button"
            onClick={() => navigate("/devices/entered")}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="md3-button md3-button--filled"
          >
            {saving ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </form>
    </main>
  );
}
