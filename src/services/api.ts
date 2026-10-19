// Cliente HTTP hacia la API FastAPI de NutriPlanner.
// Configurar la URL en un archivo .env:  VITE_API_URL=http://localhost:8000
// Mientras USE_MOCK sea true, las funciones devuelven datos de ejemplo.

import * as mock from "@/data/mock";
import type { Cuenta, PerfilAlimentario, Receta } from "@/types";

export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
export const USE_MOCK = true;

let token: string | null = null;
export const setToken = (t: string | null) => (token = t);

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) throw new Error(`Error ${res.status} en ${path}`);
  return res.json() as Promise<T>;
}

const delay = <T,>(value: T) => new Promise<T>((r) => setTimeout(() => r(value), 250));

export const api = {
  login: (correo: string, password: string) =>
    USE_MOCK
      ? delay<{ token: string; cuenta: Cuenta }>({
          token: "mock-token",
          cuenta: { id: 1, nombre_usuario: correo.split("@")[0], correo, rol: "USUARIO" },
        })
      : request<{ token: string; cuenta: Cuenta }>("/auth/login", {
          method: "POST",
          body: JSON.stringify({ correo, password }),
        }),

  registro: (nombre_usuario: string, correo: string, password: string) =>
    USE_MOCK
      ? delay<{ token: string; cuenta: Cuenta }>({
          token: "mock-token",
          cuenta: { id: 1, nombre_usuario, correo, rol: "USUARIO" },
        })
      : request<{ token: string; cuenta: Cuenta }>("/auth/registro", {
          method: "POST",
          body: JSON.stringify({ nombre_usuario, correo, password }),
        }),

  getRecetas: () => (USE_MOCK ? delay(mock.recetas) : request<Receta[]>("/recetas")),

  guardarPerfil: (perfil: PerfilAlimentario) =>
    USE_MOCK
      ? delay(perfil)
      : request<PerfilAlimentario>("/perfil", { method: "PUT", body: JSON.stringify(perfil) }),
};
