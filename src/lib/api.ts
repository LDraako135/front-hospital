export async function api<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  // Si quieres que siempre pegue al backend con prefijo /api
  const url = path.startsWith("/api") ? path : `/api${path}`;

  const token = localStorage.getItem("token"); // si usas JWT, si no, déjalo igual

  const headers = new Headers(init.headers || {});

  // Si el body NO es FormData, ponemos JSON por defecto
  const isFormData = init.body instanceof FormData;
  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // Si hay token, lo agregamos
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(url, {
    ...init,
    headers,
    credentials: "include", // 👈 siempre manda cookies/sesión
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(text || res.statusText);
  }

  // Intentamos parsear JSON, si no, devolvemos texto
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as T as T;
  }
}
