// Lógica de filtrado según el perfil alimentario (espejo de lo que hará la API).
import { alergiaIngrediente, ingredientes } from "@/data/mock";
import type { NivelDificultad, PerfilAlimentario, Receta, RecetaIngrediente } from "@/types";

const ORDEN: NivelDificultad[] = ["PRINCIPIANTE", "INTERMEDIO", "AVANZADO"];

/** ¿El ingrediente choca con alguna restricción del perfil? */
export function ingredienteProhibido(id: number, perfil: PerfilAlimentario): boolean {
  if (perfil.ingredientes_evitados.includes(id)) return true;
  const ing = ingredientes.find((i) => i.id === id);
  if (ing && perfil.categorias_evitadas.includes(ing.categoria_id)) return true;
  return perfil.alergias.some((a) => alergiaIngrediente[a]?.includes(id));
}

/** Devuelve el ingrediente a usar: el original o su sustituto explícito, o null si no hay salida. */
export function resolverIngrediente(ri: RecetaIngrediente, perfil: PerfilAlimentario) {
  if (!ingredienteProhibido(ri.ingrediente_id, perfil)) return { id: ri.ingrediente_id, sustituido: false };
  if (ri.sustituto_id && !ingredienteProhibido(ri.sustituto_id, perfil))
    return { id: ri.sustituto_id, sustituido: true };
  return null;
}

/** Una receta es apta si todos sus ingredientes son aptos (o sustituibles) y el nivel alcanza. */
export function recetaApta(r: Receta, perfil: PerfilAlimentario): boolean {
  if (ORDEN.indexOf(r.dificultad) > ORDEN.indexOf(perfil.nivel_culinario)) return false;
  return r.ingredientes.every((ri) => resolverIngrediente(ri, perfil) !== null);
}

export const nombreIngrediente = (id: number) => ingredientes.find((i) => i.id === id)?.nombre ?? "?";
