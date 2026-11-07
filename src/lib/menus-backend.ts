
import { api, type MenuGuardadoDetalle } from "@/services/api";
import type { Menu } from "@/types";

const DIAS = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

export function convertirMenuBackend(
  datos: MenuGuardadoDetalle
): Menu {
  const dias: Menu["dias"] = Array.from(
    { length: datos.cantidad_dias },
    (_, indice) => ({
      dia: DIAS[indice] ?? `Día ${indice + 1}`,
      comidas: {},
      sustituciones: {},
      instantaneas: {},
    })
  );

  for (const comida of datos.comidas) {
    const dia = dias[comida.dia - 1];

    if (!dia) continue;

    dia.comidas[comida.tipo_comida] = comida.receta_id;

    if (!dia.instantaneas) {
      dia.instantaneas = {};
    }

    dia.instantaneas[comida.tipo_comida] =
      comida.instantanea;
  }

  return {
    id: datos.id,
    nombre: datos.nombre,
    creado: datos.fecha_creacion,
    dias,
  };
}

export async function obtenerMenusDesdeBackend(): Promise<Menu[]> {
  const resumenes = await api.listarMenusBackend();

  const detalles = await Promise.all(
    resumenes.map((menu) =>
      api.obtenerMenuBackend(menu.id)
    )
  );

  return detalles.map(convertirMenuBackend);
}
