import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./externalCompanies.css";

type ExternalCompany = {
  id: number;
  identification: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

const COMPANIES_URL = "/api/companies";

type FormState = {
  identification: string;
  name: string;
};

export default function ExternalCompanies() {
  const navigate = useNavigate();

  const [companies, setCompanies] = useState<ExternalCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>({
    identification: "",
    name: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCompanies();
  }, []);

  async function loadCompanies() {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(COMPANIES_URL, {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Error al cargar empresas externas");
      }

      const data: ExternalCompany[] = await res.json();
      setCompanies(data);
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "Error al cargar empresas");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setEditingId(null);
    setForm({
      identification: "",
      name: "",
    });
  }

  function handleEdit(company: ExternalCompany) {
    setEditingId(company.id);
    setForm({
      identification: company.identification,
      name: company.name,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.identification || !form.name) {
      alert("Identificación y nombre son obligatorios.");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `${COMPANIES_URL}/${editingId}`
        : COMPANIES_URL;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          identification: form.identification,
          name: form.name,
        }),
      });

      if (!res.ok) {
        throw new Error(
          editingId
            ? "No se pudo actualizar la empresa"
            : "No se pudo crear la empresa"
        );
      }

      await loadCompanies();
      resetForm();
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "Error al guardar la empresa");
    } finally {
      setSaving(false);
    }
  }

  const normalize = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  const filteredCompanies = companies.filter((c) => {
    if (!search) return true;
    const text = normalize(`${c.identification} ${c.name}`);
    return text.includes(normalize(search));
  });

  return (
    <main className="ec-page">
      <section className="ec-container">
        <header className="ec-header">
          <h1 className="ec-title">Empresas externas</h1>

          <button
            className="ec-back-button"
            type="button"
            onClick={() => navigate("/devices/entered")}
          >
            ⬅ Volver a dispositivos
          </button>
        </header>

        {/* Barra de búsqueda */}
        <div className="ec-search-row">
          <div className="ec-search-box">
            <input
              className="ec-search-input"
              placeholder="Buscar por identificación o nombre…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Formulario alta / edición */}
        <section className="ec-form-section">
          <h2 className="ec-form-title">
            {editingId ? "Editar empresa" : "Registrar empresa externa"}
          </h2>

          <form className="ec-form" onSubmit={handleSubmit}>
            <div className="ec-form-row">
              <label className="ec-form-label">
                Identificación (NIT / código)
              </label>
              <input
                type="text"
                className="ec-form-input"
                value={form.identification}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    identification: e.target.value,
                  }))
                }
                maxLength={30}
                required
              />
            </div>

            <div className="ec-form-row">
              <label className="ec-form-label">Nombre / razón social</label>
              <input
                type="text"
                className="ec-form-input"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    name: e.target.value,
                  }))
                }
                maxLength={150}
                required
              />
            </div>

            <div className="ec-form-actions">
              <button
                type="submit"
                className="ec-primary-button"
                disabled={saving}
              >
                {saving
                  ? "Guardando…"
                  : editingId
                  ? "Guardar cambios"
                  : "Crear empresa"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="ec-secondary-button"
                  onClick={resetForm}
                >
                  Cancelar edición
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Estado / Lista */}
        {loading && (
          <p className="ec-status-text">Cargando empresas externas…</p>
        )}
        {error && !loading && (
          <p className="ec-status-text ec-status-error">{error}</p>
        )}
        {!loading && !error && filteredCompanies.length === 0 && (
          <p className="ec-status-text">
            No hay empresas registradas que coincidan con la búsqueda.
          </p>
        )}

        {!loading && !error && filteredCompanies.length > 0 && (
          <section className="ec-list-section">
            <h2 className="ec-list-title">Listado</h2>

            <div className="ec-list">
              {filteredCompanies.map((c) => (
                <article
                  key={c.id}
                  className="ec-card"
                  onClick={() => handleEdit(c)}
                >
                  <div className="ec-card-header">
                    <span className="ec-card-title">{c.name}</span>
                    <span className="ec-card-id">{c.identification}</span>
                  </div>
                  <div className="ec-card-footer">
                    <span className="ec-card-meta">
                      Creada:{" "}
                      {new Date(c.createdAt).toLocaleDateString("es-ES")}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
