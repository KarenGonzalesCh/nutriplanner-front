import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { AppLayout } from "@/components/np/AppLayout";
import { RecetaCard } from "@/components/np/RecetaCard";
import { Chip, PageHeader, comidaTexto, nivelTexto } from "@/components/np/ui";
import { recetas } from "@/data/mock";
import { useApp } from "@/lib/app-state";
import { recetaApta } from "@/lib/restricciones";
import type { NivelDificultad, TipoComida } from "@/types";

export const Route = createFileRoute("/recetas/")({
  head: () => ({
    meta: [
      { title: "Catálogo de recetas — NutriPlanner" },
      { name: "description", content: "Explorá recetas saludables filtradas según tu perfil alimentario." },
      { property: "og:title", content: "Catálogo de recetas — NutriPlanner" },
      { property: "og:description", content: "Explorá recetas saludables filtradas según tu perfil alimentario." },
    ],
  }),
  component: Catalogo,
});

function Catalogo() {
  const { perfil } = useApp();
  const [q, setQ] = useState("");
  const [tipo, setTipo] = useState<TipoComida | null>(null);
  const [nivel, setNivel] = useState<NivelDificultad | null>(null);
  const [soloAptas, setSoloAptas] = useState(true);

  const lista = useMemo(
    () =>
      recetas.filter(
        (r) =>
          r.nombre.toLowerCase().includes(q.toLowerCase()) &&
          (!tipo || r.tipos_comida.includes(tipo)) &&
          (!nivel || r.dificultad === nivel) &&
          (!soloAptas || recetaApta(r, perfil)),
      ),
    [q, tipo, nivel, soloAptas, perfil],
  );

  return (
    <AppLayout>
      <PageHeader title="Recetas" subtitle={`${lista.length} recetas encontradas`} />

      <div className="mb-8 space-y-4 rounded-2xl border bg-card p-4 shadow-card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar receta…"
            className="w-full rounded-full border border-input bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {(Object.keys(comidaTexto) as TipoComida[]).map((t) => (
            <Chip key={t} active={tipo === t} onClick={() => setTipo(tipo === t ? null : t)}>{comidaTexto[t]}</Chip>
          ))}
          <span className="mx-1 h-5 w-px bg-border" />
          {(Object.keys(nivelTexto) as NivelDificultad[]).map((n) => (
            <Chip key={n} active={nivel === n} onClick={() => setNivel(nivel === n ? null : n)}>{nivelTexto[n]}</Chip>
          ))}
          <label className="ml-auto flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" checked={soloAptas} onChange={(e) => setSoloAptas(e.target.checked)} className="accent-primary" />
            Solo aptas para mi perfil
          </label>
        </div>
      </div>

      {lista.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">No hay recetas con esos filtros.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {lista.map((r) => <RecetaCard key={r.id} receta={r} apta={recetaApta(r, perfil)} />)}
        </div>
      )}
    </AppLayout>
  );
}
