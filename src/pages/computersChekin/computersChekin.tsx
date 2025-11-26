// src/pages/computersChekin.tsx
import React, { useRef, useState } from "react";
import "./computersChekin.css";
import BottomNav from "../../components/BottomNav";
import { api } from "../../lib/api";
import { logAudit } from "../../utils/audit";

export default function ComputersCheckin() {
  const [segment, setSegment] = useState<0 | 1>(0);

  const [brand, setBrand] = useState("");
  const [color, setColor] = useState("");
  const [model, setModel] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerId, setOwnerId] = useState("");
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

    const brandTrim = brand.trim();
    const modelTrim = model.trim();
    const colorTrim = color.trim();
    const ownerNameTrim = ownerName.trim();
    const ownerIdTrim = ownerId.trim();
    const descriptionsTrim = descriptions.trim();

    if (!modelTrim) {
      setError("El modelo es obligatorio.");
      setSubmitting(false);
      return;
    }

    if (!brandTrim || brandTrim.length < 2) {
      setError("La marca es obligatoria y debe tener al menos 2 caracteres.");
      setSubmitting(false);
      return;
    }

    if (!colorTrim || colorTrim.length < 3) {
      setError("El color es obligatorio y debe tener al menos 3 caracteres.");
      setSubmitting(false);
      return;
    }

    if (!ownerNameTrim || ownerNameTrim.length < 5) {
      setError(
        "El nombre del usuario es obligatorio y debe tener al menos 5 caracteres."
      );
      setSubmitting(false);
      return;
    }

    if (!ownerIdTrim || ownerIdTrim.length < 5) {
      setError(
        "La identificación es obligatoria y debe tener al menos 5 caracteres."
      );
      setSubmitting(false);
      return;
    }

    if (!file) {
      setError("La imagen es obligatoria.");
      setSubmitting(false);
      return;
    }

    const form = new FormData();
    form.append("brand", brandTrim);
    form.append("model", modelTrim);
    form.append("color", colorTrim);
    form.append("ownerName", ownerNameTrim);
    form.append("ownerId", ownerIdTrim);
    form.append("descriptions", descriptionsTrim);
    form.append("photo", file);

    const isFrequent = segment === 0;
    // Solo si tu schema lo acepta, si no, comenta esta línea:
    form.append("isFrequent", isFrequent ? "true" : "false");

    const endpoint = isFrequent
      ? "/computers/frequent" // 👉 /api/computers/frequent (api.ts le agrega /api)
      : "/computers/checkin"; // 👉 /api/computers/checkin

    try {
      // api debe devolverte el JSON del computador creado
      const created = await api(endpoint, {
        method: "POST",
        body: form,
      });

      // Auditoría CREATE (computador)
      await logAudit("CREATE", {
        id: String(created.id),
        kind: "computer",
        brand: created.brand ?? brandTrim,
        model: created.model ?? modelTrim,
        userName: created.ownerName ?? ownerNameTrim,
        userId: created.ownerId ?? ownerIdTrim,
      });

      // Reset de formulario
      setBrand("");
      setColor("");
      setModel("");
      setOwnerName("");
      setOwnerId("");
      setDescriptions("");
      setFile(null);
      setPreview(null);
      setSegment(0);

      alert(
        isFrequent
          ? "Computador frecuente guardado correctamente."
          : "Computador guardado correctamente."
      );
    } catch (err: any) {
      setError(err?.message || "Error al guardar el computador.");
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
            <h2 className="md3-title">Computadores</h2>
            <p className="md3-subtitle">Selecciona una opción</p>

            {/* Segmented — Frequent / Non frequent */}
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
                Frecuente
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
                No Frecuente
              </button>
            </div>

            {/* Inputs */}
            <div className="md3-fields">
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

              {/* Marca y Color en la misma línea */}
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
                  <label className="md3-field-label">Color</label>
                  <div className="md3-textfield">
                    <input
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      placeholder="Ingrese el color"
                      className="md3-textfield-input"
                    />
                  </div>
                </div>
              </div>

              <div className="md3-field-row">
                <div className="md3-field">
                  <label className="md3-field-label">Usuario</label>
                  <div className="md3-textfield">
                    <input
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="Ingrese el nombre del usuario"
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
                      placeholder="Ingrese la identificación"
                      className="md3-textfield-input"
                    />
                  </div>
                </div>
              </div>

              <div className="md3-field">
                <label className="md3-field-label">
                  Descripción del computador
                </label>
                <div className="md3-textfield md3-textfield--textarea">
                  <textarea
                    rows={4}
                    value={descriptions}
                    onChange={(e) => setDescriptions(e.target.value)}
                    placeholder="Ingrese la descripción del computador"
                    className="md3-textfield-input md3-textfield-textarea"
                  />
                </div>
              </div>

              {error && <p className="md3-error">{error}</p>}
            </div>
          </section>

          {/* Columna derecha — Dropper */}
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

        <div className="md3-card-actions">
          <button
            type="submit"
            disabled={submitting}
            className="md3-button md3-button--filled"
          >
            {submitting ? "Guardando…" : "Ingresar Computador"}
          </button>
        </div>
      </form>
    </main>
  );
}
