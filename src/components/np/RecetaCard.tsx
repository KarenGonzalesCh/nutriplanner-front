import { Link } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import type { Receta } from "@/types";
import { Badge, comidaTexto, nivelTexto } from "./ui";

export function RecetaCard({ receta, apta }: { receta: Receta; apta: boolean }) {
  return (
    <Link
      to="/recetas/$id"
      params={{ id: String(receta.id) }}
      className="group overflow-hidden rounded-2xl border bg-card shadow-card transition hover:-translate-y-0.5 hover:shadow-lift"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={receta.imagen} alt={receta.nombre} loading="lazy" width={1024} height={768} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        {!apta && (
          <span className="absolute left-3 top-3 rounded-full bg-warning-soft px-2.5 py-1 text-xs font-semibold text-warning">
            No apta para tu perfil
          </span>
        )}
      </div>
      <div className="space-y-2 p-4">
        <h3 className="text-lg font-semibold leading-snug">{receta.nombre}</h3>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{receta.tiempo_preparacion} min</span>
          <span>·</span>
          <span>{nivelTexto[receta.dificultad]}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {receta.tipos_comida.map((t) => <Badge key={t}>{comidaTexto[t]}</Badge>)}
        </div>
      </div>
    </Link>
  );
}
