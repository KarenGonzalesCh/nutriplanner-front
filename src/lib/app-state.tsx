import { createContext, useContext, useEffect, useRef, useState, useCallback, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { menusIniciales } from "@/data/mock";
import { api, setToken, setOnUnauthorized, ApiError, getErrorMessage, USE_MOCK } from "@/services/api";
import type { Cuenta, Menu, PerfilAlimentario } from "@/types";

interface AppState {
  cuenta: Cuenta | null;
  perfil: PerfilAlimentario;
  menus: Menu[];
  favoritas: number[];
  excluidas: number[];
  cargandoSesion: boolean;
  iniciarSesion: (cuenta: Cuenta, token: string) => Promise<void>;
  cerrarSesion: () => void;
  setPerfil: (p: PerfilAlimentario) => Promise<void>;
  guardarMenu: (m: Omit<Menu, "id" | "creado">) => void;
  borrarMenu: (id: number) => void;
  alternarFavorita: (id: number) => Promise<void>;
  alternarExcluida: (id: number) => Promise<void>;
}

const Ctx = createContext<AppState | null>(null);

export const perfilVacio: PerfilAlimentario = {
  nivel_culinario: "PRINCIPIANTE",
  alergias: [],
  ingredientes_evitados: [],
  categorias_evitadas: [],
};

const leer = <T,>(key: string, fallback: T): T => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

type TipoPreferencia = "favorita" | "exclusion";

export function AppProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [cuenta, setCuenta] = useState<Cuenta | null>(null);
  const [perfil, setPerfilState] = useState<PerfilAlimentario>(perfilVacio);
  const [menus, setMenus] = useState<Menu[]>(menusIniciales);
  const [favoritas, setFavoritas] = useState<number[]>([]);
  const [excluidas, setExcluidas] = useState<number[]>([]);
  const [cargandoSesion, setCargandoSesion] = useState(true);

  // Evita aplicar respuestas de una sesión anterior luego de cerrar sesión.
  const versionSesion = useRef(0);
  // Evita que un doble clic envíe dos operaciones contradictorias.
  const operacionesPendientes = useRef<Set<string>>(new Set());

  // Recarga perfil y preferencias desde FastAPI. No usa localStorage en producción.
  const sincronizarUsuario = async (
    version: number,
    puedeActualizar: () => boolean = () => true
  ): Promise<void> => {
    const [resultadoPerfil, resultadoFavoritas, resultadoExcluidas] =
      await Promise.allSettled([
        api.getPerfil(),
        api.getFavoritas(),
        api.getExcluidas(),
      ]);

    if (version !== versionSesion.current || !puedeActualizar()) return;

    if (resultadoPerfil.status === "fulfilled") {
      setPerfilState(resultadoPerfil.value ?? perfilVacio);
    } else {
      console.error("No se pudo recuperar el perfil:", resultadoPerfil.reason);
    }

    if (resultadoFavoritas.status === "fulfilled") {
      setFavoritas(resultadoFavoritas.value);
    } else {
      console.error("No se pudieron recuperar favoritas:", resultadoFavoritas.reason);
    }

    if (resultadoExcluidas.status === "fulfilled") {
      setExcluidas(resultadoExcluidas.value);
    } else {
      console.error("No se pudieron recuperar exclusiones:", resultadoExcluidas.reason);
    }

    if (
      resultadoFavoritas.status === "rejected" ||
      resultadoExcluidas.status === "rejected"
    ) {
      toast.error("No se pudieron sincronizar todas tus preferencias. Actualizá la página para reintentar.", {
        id: "preferencias-sync-error",
      });
    }
  };

  // INICIAR SESIÓN
  const iniciarSesion = async (
    nuevaCuenta: Cuenta,
    nuevoToken: string
  ): Promise<void> => {
    const version = ++versionSesion.current;
    operacionesPendientes.current.clear();
    setToken(nuevoToken);
    sessionStorage.setItem("nutriplanner-token", nuevoToken);
    setCuenta(nuevaCuenta);
    setPerfilState(perfilVacio);
    setFavoritas([]);
    setExcluidas([]);

    if (USE_MOCK) return;
    await sincronizarUsuario(version);
  };

  // CERRAR SESIÓN
  const cerrarSesion = useCallback(() => {
    ++versionSesion.current;
    operacionesPendientes.current.clear();
    setToken(null);
    try {
      sessionStorage.removeItem("nutriplanner-token");
    } catch {
      // Ignorar si sessionStorage no está accesible.
    }
    setCuenta(null);
    setPerfilState(perfilVacio);
    setMenus([]);
    setFavoritas([]);
    setExcluidas([]);
    void navigate({ to: "/" });
  }, [navigate]);

  // SUSCRIPCIÓN AL INTERCEPTOR DE TOKEN EXPIRADO / 401
  useEffect(() => {
    setOnUnauthorized(() => {
      cerrarSesion();
    });

    return () => {
      setOnUnauthorized(null);
    };
  }, [cerrarSesion]);

  // DATOS SIMULADOS: solamente en modo mock.
  useEffect(() => {
    if (!USE_MOCK) return;

    setPerfilState(leer("nutriplanner-perfil", perfilVacio));
    setMenus(leer("nutriplanner-menus", menusIniciales));
    setFavoritas(leer("nutriplanner-favoritas", []));
    setExcluidas(leer("nutriplanner-excluidas", []));
  }, []);

  // GUARDAR PERFIL
  const setPerfil = async (p: PerfilAlimentario): Promise<void> => {
    if (USE_MOCK) {
      setPerfilState(p);
      localStorage.setItem("nutriplanner-perfil", JSON.stringify(p));
      return;
    }

    const perfilGuardado = await api.guardarPerfil(p);
    setPerfilState(perfilGuardado);
  };

  // MENÚS: se mantienen como están para abordarlos en la siguiente etapa.
  const guardarMenu = (m: Omit<Menu, "id" | "creado">) =>
    setMenus(prev => {
      const next = [
        { ...m, id: Date.now(), creado: new Date().toISOString() },
        ...prev,
      ];
      localStorage.setItem("nutriplanner-menus", JSON.stringify(next));
      return next;
    });

  const borrarMenu = (id: number) =>
    setMenus(prev => {
      const next = prev.filter(m => m.id !== id);
      localStorage.setItem("nutriplanner-menus", JSON.stringify(next));
      return next;
    });

  // Conserva el funcionamiento local si explícitamente se habilita USE_MOCK.
  const alternarLocal = (
    key: "nutriplanner-favoritas" | "nutriplanner-excluidas",
    setter: (fn: (p: number[]) => number[]) => void,
    id: number
  ): void => {
    setter(prev => {
      const next = prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id];
      localStorage.setItem(key, JSON.stringify(next));
      return next;
    });
  };

  // FAVORITAS Y EXCLUSIONES: operaciones reales de FastAPI/Supabase.
  const alternarPreferencia = async (
    tipo: TipoPreferencia,
    id: number
  ): Promise<void> => {
    if (USE_MOCK) {
      if (tipo === "favorita") {
        alternarLocal("nutriplanner-favoritas", setFavoritas, id);
      } else {
        alternarLocal("nutriplanner-excluidas", setExcluidas, id);
      }
      return;
    }

    if (!cuenta) {
      toast.error("Iniciá sesión para modificar tus preferencias.");
      return;
    }

    const version = versionSesion.current;
    const clave = `${version}:${tipo}:${id}`;
    if (operacionesPendientes.current.has(clave)) return;
    operacionesPendientes.current.add(clave);

    const esFavorita = tipo === "favorita";
    const actuales = esFavorita ? favoritas : excluidas;
    const estabaAgregada = actuales.includes(id);
    const actualizar = esFavorita ? setFavoritas : setExcluidas;

    try {
      if (esFavorita) {
        if (estabaAgregada) {
          await api.quitarFavorita(id);
        } else {
          await api.agregarFavorita(id);
        }
      } else if (estabaAgregada) {
        await api.quitarExclusion(id);
      } else {
        await api.agregarExclusion(id);
      }

      if (version !== versionSesion.current) return;

      // El ícono cambia sólo cuando FastAPI confirmó la operación (204).
      actualizar(prev =>
        estabaAgregada
          ? prev.filter(x => x !== id)
          : prev.includes(id) ? prev : [...prev, id]
      );
    } catch (err) {
      if (version === versionSesion.current) {
        toast.error(getErrorMessage(err, "No se pudo guardar la preferencia."));
      }
    } finally {
      operacionesPendientes.current.delete(clave);
    }
  };

  // RESTAURAR SESIÓN AL RECARGAR
  useEffect(() => {
    let activo = true;
    const version = versionSesion.current;

    const restaurarSesion = async () => {
      const tokenGuardado = sessionStorage.getItem("nutriplanner-token");

      if (!tokenGuardado || USE_MOCK) {
        if (activo) setCargandoSesion(false);
        return;
      }

      setToken(tokenGuardado);

      try {
        const cuentaActual = await api.getCuenta();
        if (!activo || version !== versionSesion.current) return;

        setCuenta(cuentaActual);
        setFavoritas([]);
        setExcluidas([]);
        await sincronizarUsuario(version, () => activo);
      } catch (err) {
        console.error("No se pudo recuperar la sesión:", err);

        if (activo && version === versionSesion.current) {
          if (err instanceof ApiError && err.isNetworkError) {
            toast.error(
              "No se pudo conectar con el servidor para sincronizar tu sesión.",
              { id: "session-network-error" }
            );
          } else {
            setToken(null);
            try {
              sessionStorage.removeItem("nutriplanner-token");
            } catch {
              // Ignorar.
            }
          }
          setCuenta(null);
          setPerfilState(perfilVacio);
          setFavoritas([]);
          setExcluidas([]);
        }
      } finally {
        if (activo) setCargandoSesion(false);
      }
    };

    void restaurarSesion();

    return () => {
      activo = false;
    };
  }, []);

  return (
    <Ctx.Provider
      value={{
        cuenta,
        perfil,
        menus,
        favoritas,
        excluidas,
        cargandoSesion,
        iniciarSesion,
        cerrarSesion,
        setPerfil,
        guardarMenu,
        borrarMenu,
        alternarFavorita: (id) => alternarPreferencia("favorita", id),
        alternarExcluida: (id) => alternarPreferencia("exclusion", id),
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useApp() {
  const ctx = useContext(Ctx);

  if (!ctx) {
    throw new Error("useApp debe usarse dentro de <AppProvider>");
  }

  return ctx;
}
