import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { menusIniciales } from "@/data/mock";
import { setToken } from "@/services/api";
import type { Cuenta, Menu, PerfilAlimentario } from "@/types";

interface AppState {
  cuenta: Cuenta | null;
  perfil: PerfilAlimentario;
  menus: Menu[];
  favoritas: number[];
  excluidas: number[];
  iniciarSesion: (cuenta: Cuenta, token: string) => void;
  cerrarSesion: () => void;
  setPerfil: (p: PerfilAlimentario) => void;
  guardarMenu: (m: Omit<Menu, "id" | "creado">) => void;
  borrarMenu: (id: number) => void;
  alternarFavorita: (id: number) => void;
  alternarExcluida: (id: number) => void;
}
const Ctx = createContext<AppState | null>(null);
export const perfilVacio: PerfilAlimentario = { nivel_culinario: "PRINCIPIANTE", alergias: [], ingredientes_evitados: [], categorias_evitadas: [] };
const leer = <T,>(key: string, fallback: T): T => { try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; } catch { return fallback; } };
export function AppProvider({ children }: { children: ReactNode }) {
  const [cuenta, setCuenta] = useState<Cuenta | null>(null);
  const [perfil, setPerfilState] = useState<PerfilAlimentario>(perfilVacio);
  const [menus, setMenus] = useState<Menu[]>(menusIniciales);
  const [favoritas, setFavoritas] = useState<number[]>([]);
  const [excluidas, setExcluidas] = useState<number[]>([]);
  useEffect(() => { setPerfilState(leer("nutriplanner-perfil", perfilVacio)); setMenus(leer("nutriplanner-menus", menusIniciales)); setFavoritas(leer("nutriplanner-favoritas", [])); setExcluidas(leer("nutriplanner-excluidas", [])); }, []);
  const setPerfil = (p: PerfilAlimentario) => { setPerfilState(p); localStorage.setItem("nutriplanner-perfil", JSON.stringify(p)); };
  const guardarMenu = (m: Omit<Menu, "id" | "creado">) => setMenus(prev => { const next = [{ ...m, id: Date.now(), creado: new Date().toISOString() }, ...prev]; localStorage.setItem("nutriplanner-menus", JSON.stringify(next)); return next; });
  const borrarMenu = (id: number) => setMenus(prev => { const next = prev.filter(m => m.id !== id); localStorage.setItem("nutriplanner-menus", JSON.stringify(next)); return next; });
  const alternar = (key: "nutriplanner-favoritas" | "nutriplanner-excluidas", setter: (fn: (p: number[]) => number[]) => void, id: number) => setter(prev => { const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]; localStorage.setItem(key, JSON.stringify(next)); return next; });
  return <Ctx.Provider value={{ cuenta, perfil, menus, favoritas, excluidas, iniciarSesion: (c, t) => { setToken(t); setCuenta(c); }, cerrarSesion: () => { setToken(null); setCuenta(null); }, setPerfil, guardarMenu, borrarMenu, alternarFavorita: id => alternar("nutriplanner-favoritas", setFavoritas, id), alternarExcluida: id => alternar("nutriplanner-excluidas", setExcluidas, id) }}>{children}</Ctx.Provider>;
}
export function useApp() { const ctx = useContext(Ctx); if (!ctx) throw new Error("useApp debe usarse dentro de <AppProvider>"); return ctx; }
