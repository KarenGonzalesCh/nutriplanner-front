// Estado global simple (sesión, perfil y menús) con React Context.
// Cuando se conecte la API, estos valores vendrán de las respuestas HTTP.
import { createContext, useContext, useState, type ReactNode } from "react";
import { menusIniciales } from "@/data/mock";
import { setToken } from "@/services/api";
import type { Cuenta, Menu, PerfilAlimentario } from "@/types";

interface AppState {
  cuenta: Cuenta | null;
  perfil: PerfilAlimentario;
  menus: Menu[];
  iniciarSesion: (cuenta: Cuenta, token: string) => void;
  cerrarSesion: () => void;
  setPerfil: (p: PerfilAlimentario) => void;
  guardarMenu: (m: Omit<Menu, "id" | "creado">) => void;
  borrarMenu: (id: number) => void;
}

const Ctx = createContext<AppState | null>(null);

export const perfilVacio: PerfilAlimentario = {
  nivel_culinario: "PRINCIPIANTE",
  alergias: [],
  ingredientes_evitados: [],
  categorias_evitadas: [],
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [cuenta, setCuenta] = useState<Cuenta | null>(null);
  const [perfil, setPerfil] = useState<PerfilAlimentario>(perfilVacio);
  const [menus, setMenus] = useState<Menu[]>(menusIniciales);

  const value: AppState = {
    cuenta,
    perfil,
    menus,
    iniciarSesion: (c, t) => {
      setToken(t);
      setCuenta(c);
    },
    cerrarSesion: () => {
      setToken(null);
      setCuenta(null);
    },
    setPerfil,
    guardarMenu: (m) =>
      setMenus((prev) => [{ ...m, id: Date.now(), creado: new Date().toISOString() }, ...prev]),
    borrarMenu: (id) => setMenus((prev) => prev.filter((m) => m.id !== id)),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp debe usarse dentro de <AppProvider>");
  return ctx;
}
