import { alergiaIngrediente, ingredientes } from "@/data/mock";
import type { NivelDificultad, PerfilAlimentario, Receta, RecetaIngrediente } from "@/types";
const ORDEN: NivelDificultad[] = ["PRINCIPIANTE", "INTERMEDIO", "AVANZADO"];
export function ingredienteProhibido(id: number, perfil: PerfilAlimentario): boolean { if (perfil.ingredientes_evitados.includes(id)) return true; const ing = ingredientes.find(i => i.id === id); if (ing && perfil.categorias_evitadas.includes(ing.categoria_id)) return true; return perfil.alergias.some(a => alergiaIngrediente[a]?.includes(id)); }
export function resolverIngrediente(ri: RecetaIngrediente, perfil: PerfilAlimentario) { if (!ingredienteProhibido(ri.ingrediente_id, perfil)) return { id: ri.ingrediente_id, sustituido: false }; if (ri.sustituto_id && !ingredienteProhibido(ri.sustituto_id, perfil)) return { id: ri.sustituto_id, sustituido: true }; return null; }
export function estadoReceta(r: Receta, perfil: PerfilAlimentario): "COMPATIBLE" | "SUSTITUCION" | "NO_DISPONIBLE" { if (ORDEN.indexOf(r.dificultad) > ORDEN.indexOf(perfil.nivel_culinario)) return "NO_DISPONIBLE"; let sustitucion = false; for (const ri of r.ingredientes) { const res = resolverIngrediente(ri, perfil); if (!res) return "NO_DISPONIBLE"; sustitucion ||= res.sustituido; } return sustitucion ? "SUSTITUCION" : "COMPATIBLE"; }
export function recetaApta(r: Receta, perfil: PerfilAlimentario) { return estadoReceta(r, perfil) !== "NO_DISPONIBLE"; }
export const nombreIngrediente = (id: number) => ingredientes.find(i => i.id === id)?.nombre ?? "?";
