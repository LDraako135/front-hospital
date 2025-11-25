import React, { useRef, useState } from "react";
import "./MedicalDevicesCheckin.css";

export default function MedicalDeviceCheckin() {
  const [segment, setSegment] = useState<0 | 1>(0); // Externo / Biomédico (solo visual)

  // === CAMPOS QUE EL BACKEND ESPERA ===
  const [brand, setBrand] = useState("");        // brand
  const [model, setModel] = useState("");        // model
  const [serial, setSerial] = useState("");      // serial
  const [ownerName, setOwnerName] = useState(""); // ownerName
  const [ownerId, setOwnerId] = useState("");     // ownerId

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

    const form = new FormData();

    // 👇 ESTOS NOMBRES DEBEN COINCIDIR CON MED_DEVICE_REQUEST_SCHEMA
    form.append("brand", brand.trim());
    form.append("model", model.trim());
    form.append("ownerName", ownerName.trim());
    form.append("ownerId", ownerId.trim());
    form.append("serial", serial.trim());
    form.append("photo", file);

    // 👇 Estos son opcionales, el schema actual los ignora
    form.append("provider", provider.trim());
    form.append("descriptions", descriptions.trim());
    form.append("category", segment === 0 ? "externo" : "biomedico");

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
        // limpiar formulario
        setBrand("");
        setModel("");
        setSerial("");
        setOwnerName("");
        setOwnerId("");
        setProvider("");
        setDescriptions("");
        setFile(null);
        setPreview(null);
        alert("Dispositivo guardado con éxito.");
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
            <h2 className="md3-title">Externo / Biomédico</h2>
            <p className="md3-subtitle">Seleccione una opción</p>

            {/* Segmentado visual */}
            <div className="md3-segment">
              <button
                type="button"
                onClick={() => setSegment(0)}
                className={
                  "md3-segment-button" +
                  (segment === 0 ? " md3-segment-button--active" : "")
                }
              >
                <span
                  className={
                    "md3-segment-icon" +
                    (segment === 0 ? " md3-segment-icon--ok" : "")
                  }
                >
                  ✓
                </span>
                Externo
              </button>

              <button
                type="button"
                onClick={() => setSegment(1)}
                className={
                  "md3-segment-button" +
                  (segment === 1 ? " md3-segment-button--active" : "")
                }
              >
                <span
                  className={
                    "md3-segment-icon" +
                    (segment === 1 ? " md3-segment-icon--error" : "")
                  }
                >
                  ✕
                </span>
                Biomédico
              </button>
            </div>

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
                  Ingrese descripciones del artículo separadas por comas
                </label>
                <div className="md3-textfield md3-textfield--textarea">
                  <textarea
                    rows={4}
                    value={descriptions}
                    onChange={(e) => setDescriptions(e.target.value)}
                    placeholder="Escriba una o varias descripciones aquí"
                    className="md3-textfield-input md3-textfield-textarea"
                  />
                </div>
              </div>

              {error && <p className="md3-error">{error}</p>}
            </div>
          </section>

          {/* Columna derecha: imagen + botón alineado */}
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

              {preview && (
                <img src={preview} className="md3-dropper-preview" />
              )}

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

          {/* Botón alineado con el dropper */}
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
                {submitting ? "Guardando…" : "Dar salida"}
              </button>
            </div>
      </form>

    </main>
  );
}
