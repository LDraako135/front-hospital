import React, { useRef, useState } from "react";
import "./MedicalDevicesCheckin.css";
import { logAudit } from "../../utils/audit";

export default function MedicalDeviceCheckin() {
  // === CAMPOS QUE EL BACKEND ESPERA ===
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [serial, setSerial] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerId, setOwnerId] = useState("");

  // === CAMPOS EXTRA (solo UI) ===
  const [provider, setProvider] = useState("");
  const [descriptions, setDescriptions] = useState("");

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!file) {
      setError("La imagen es obligatoria.");
      setSubmitting(false);
      return;
    }

    const brandTrim = brand.trim();
    const modelTrim = model.trim();
    const ownerNameTrim = ownerName.trim();
    const ownerIdTrim = ownerId.trim();
    const serialTrim = serial.trim();
    const providerTrim = provider.trim();
    const descriptionsTrim = descriptions.trim();

    const form = new FormData();
    form.append("brand", brandTrim);
    form.append("model", modelTrim);
    form.append("ownerName", ownerNameTrim);
    form.append("ownerId", ownerIdTrim);
    form.append("serial", serialTrim);
    form.append("photo", file);

    // Extras opcionales
    form.append("provider", providerTrim);
    form.append("descriptions", descriptionsTrim);

    try {
      const res = await fetch("/api/medicaldevices/checkin", {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        let msg = "Error al guardar el dispositivo.";
        try {
          const data = await res.json();
          if (data?.message) msg = data.message;
        } catch {
          msg = await res.text();
        }
        setError(msg);
      } else {
        const created = await res.json();

        // Auditoría CREATE (dispositivo biomédico)
        await logAudit("CREATE", {
          id: String(created.id),
          kind: "medical",
          brand: created.brand ?? brandTrim,
          model: created.model ?? modelTrim,
          userName: created.ownerName ?? ownerNameTrim,
          userId: created.ownerId ?? ownerIdTrim,
        });

        setBrand("");
        setModel("");
        setSerial("");
        setOwnerName("");
        setOwnerId("");
        setProvider("");
        setDescriptions("");
        setFile(null);
        setPreview(null);
        alert("Dispositivo biomédico guardado con éxito.");
      }
    } catch {
      setError("Error de conexión con el servidor.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="md3-page">
      <form onSubmit={onSubmit} className="md3-card">
        <div className="md3-card-grid">
          {/* Columna izquierda */}
          <section className="md3-column-left">
            <h2 className="md3-title">Dispositivos biomédicos</h2>

            {/* Campos */}
            <div className="md3-fields">
              {/* Marca / Modelo */}
              <div className="md3-field-row">
                <div className="md3-field">
                  <label className="md3-field-label">Marca</label>
                  <div className="md3-textfield">
                    <input
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="Ingrese la marca"
                      className="md3-textfield-input"
                    />
                  </div>
                </div>

                <div className="md3-field">
                  <label className="md3-field-label">Modelo</label>
                  <div className="md3-textfield">
                    <input
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      placeholder="Ingrese el modelo"
                      className="md3-textfield-input"
                    />
                  </div>
                </div>
              </div>

              {/* Serial / Proveedor */}
              <div className="md3-field-row">
                <div className="md3-field">
                  <label className="md3-field-label">Identificación serial</label>
                  <div className="md3-textfield">
                    <input
                      value={serial}
                      onChange={(e) => setSerial(e.target.value)}
                      placeholder="Ingrese serial"
                      className="md3-textfield-input"
                    />
                  </div>
                </div>

                <div className="md3-field">
                  <label className="md3-field-label">Proveedor</label>
                  <div className="md3-textfield">
                    <input
                      value={provider}
                      onChange={(e) => setProvider(e.target.value)}
                      placeholder="Ingrese proveedor"
                      className="md3-textfield-input"
                    />
                  </div>
                </div>
              </div>

              {/* Nombre usuario / Identificación */}
              <div className="md3-field-row">
                <div className="md3-field">
                  <label className="md3-field-label">Nombre de usuario</label>
                  <div className="md3-textfield">
                    <input
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="Nombre del usuario"
                      className="md3-textfield-input"
                    />
                  </div>
                </div>

                <div className="md3-field">
                  <label className="md3-field-label">Identificación</label>
                  <div className="md3-textfield">
                    <input
                      value={ownerId}
                      onChange={(e) => setOwnerId(e.target.value)}
                      placeholder="Número de documento"
                      className="md3-textfield-input"
                    />
                  </div>
                </div>
              </div>

              {/* Descripciones */}
              <div className="md3-field">
                <label className="md3-field-label">
                  Descripciones del artículo
                </label>
                <div className="md3-textfield md3-textfield--textarea">
                  <textarea
                    rows={4}
                    value={descriptions}
                    onChange={(e) => setDescriptions(e.target.value)}
                    placeholder="Escriba descripciones aquí"
                    className="md3-textfield-input md3-textfield-textarea"
                  />
                </div>
              </div>

              {error && <p className="md3-error">{error}</p>}
            </div>
          </section>

          {/* Columna derecha: imagen */}
          <section className="md3-column-right">
            <p className="md3-title">Subir Imagen</p>

            <div
              className="md3-dropper"
              onClick={() => inputRef.current?.click()}
            >
              {!preview && (
                <div className="md3-dropper-decor">
                  <svg viewBox="0 0 400 220" className="md3-dropper-svg">
                    <g opacity="0.35">
                      <path
                        transform="translate(-20, -20)"
                        d="M190 40c6-12 24-12 30 0l12 24c6 12-3 27-17 27h-20c-14 0-23-15-17-27l12-24z"
                        fill="#413f43ff"
                      />
                      <circle cx="100" cy="135" r="30" fill="#413f43ff" />
                      <rect
                        x="245"
                        y="100"
                        width="60"
                        height="60"
                        rx="12"
                        fill="#413f43ff"
                      />
                    </g>
                  </svg>
                </div>
              )}

              {preview && <img src={preview} className="md3-dropper-preview" />}

              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="md3-dropper-input"
                onChange={onFileChange}
              />
            </div>
          </section>
        </div>

        {/* Botón */}
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "16px",
          }}
        >
          <button
            type="submit"
            disabled={submitting}
            className="md3-button md3-button--filled"
          >
            {submitting ? "Guardando…" : "Ingresar Dispositivo Biomédico"}
          </button>
        </div>
      </form>
    </main>
  );
}
