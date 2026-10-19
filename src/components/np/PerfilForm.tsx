// Formulario de perfil alimentario, usado en el onboarding y en "Perfil".
import { useState } from "react";
import { alergias, categorias, ingredientes } from "@/data/mock";
import type { NivelDificultad, PerfilAlimentario } from "@/types";
import { Button, Card, Chip, nivelTexto } from "./ui";

const toggle = (list: number[], id: number) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

export function PerfilForm({
  inicial,
  onGuardar,
  textoBoton,
}: {
  inicial: PerfilAlimentario;
  onGuardar: (p: PerfilAlimentario) => void | Promise<void>;
  textoBoton: string;
}) {
  const [p, setP] = useState(inicial);
  const [guardando, setGuardando] = useState(false);

  const submit = async () => {
    setGuardando(true);
    await onGuardar(p);
    setGuardando(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-xl font-semibold">Alergias declaradas</h2>
        <p className="mb-4 mt-1 text-sm text-muted-foreground">Nunca te sugeriremos recetas con estos alérgenos.</p>
        <div className="flex flex-wrap gap-2">
          {alergias.map((a) => (
            <Chip key={a.id} tone="warning" active={p.alergias.includes(a.id)} onClick={() => setP({ ...p, alergias: toggle(p.alergias, a.id) })}>
              {a.nombre}
            </Chip>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold">Categorías que preferís evitar</h2>
        <p className="mb-4 mt-1 text-sm text-muted-foreground">Por gusto o estilo de alimentación (ej. vegetariano).</p>
        <div className="flex flex-wrap gap-2">
          {categorias.map((c) => (
            <Chip key={c.id} active={p.categorias_evitadas.includes(c.id)} onClick={() => setP({ ...p, categorias_evitadas: toggle(p.categorias_evitadas, c.id) })}>
              {c.nombre}
            </Chip>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold">Ingredientes a evitar</h2>
        <p className="mb-4 mt-1 text-sm text-muted-foreground">Si una receta los usa, buscaremos un sustituto.</p>
        <div className="flex flex-wrap gap-2">
          {ingredientes.map((i) => (
            <Chip key={i.id} active={p.ingredientes_evitados.includes(i.id)} onClick={() => setP({ ...p, ingredientes_evitados: toggle(p.ingredientes_evitados, i.id) })}>
              {i.nombre}
            </Chip>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold">Nivel culinario</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {(Object.keys(nivelTexto) as NivelDificultad[]).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setP({ ...p, nivel_culinario: n })}
              className={`rounded-xl border p-4 text-left transition ${p.nivel_culinario === n ? "border-primary bg-primary-soft" : "hover:border-primary/50"}`}
            >
              <div className="font-semibold">{nivelTexto[n]}</div>
              <div className="text-xs text-muted-foreground">
                {n === "PRINCIPIANTE" ? "Recetas simples y rápidas" : n === "INTERMEDIO" ? "Algunas técnicas extra" : "Cualquier receta"}
              </div>
            </button>
          ))}
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={submit} disabled={guardando}>{guardando ? "Guardando…" : textoBoton}</Button>
      </div>
    </div>
  );
}
