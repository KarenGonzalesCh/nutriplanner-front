import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { RefreshCw, Sparkles } from "lucide-react";
import { AppLayout } from "@/components/np/AppLayout";
import { Button, Card, Chip, PageHeader, comidaTexto } from "@/components/np/ui";
import { recetas } from "@/data/mock";
import { useApp } from "@/lib/app-state";
import { recetaApta } from "@/lib/restricciones";
import type { Menu, TipoComida } from "@/types";

export const Route = createFileRoute("/generador")({
  head: () => ({
    meta: [
      { title: "Generar menú — NutriPlanner" },
      { name: "description", content: "Creá un menú semanal personalizado que respeta tus restricciones." },
      { property: "og:title", content: "Generar menú — NutriPlanner" },
      { property: "og:description", content: "Creá un menú semanal personalizado que respeta tus restricciones." },
    ],
  }),
  component: Generador,
});

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const TIPOS = Object.keys(comidaTexto) as TipoComida[];

function Generador() {
  const { perfil, guardarMenu } = useApp();
  const navigate = useNavigate();
  const [cantDias, setCantDias] = useState(3);
  const [comidas, setComidas] = useState<TipoComida[]>(["DESAYUNO", "ALMUERZO", "CENA"]);
  const [menu, setMenu] = useState<Menu["dias"] | null>(null);
  const [nombre, setNombre] = useState("Mi menú semanal");

  const generar = () => {
    const aptas = recetas.filter((r) => recetaApta(r, perfil));
    const dias = DIAS.slice(0, cantDias).map((dia) => {
      const c: Menu["dias"][number]["comidas"] = {};
      for (const t of comidas) {
        const opciones = aptas.filter((r) => r.tipos_comida.includes(t));
        if (opciones.length) c[t] = opciones[Math.floor(Math.random() * opciones.length)].id;
      }
      return { dia, comidas: c };
    });
    setMenu(dias);
  };

  return (
    <AppLayout>
      <PageHeader title="Generar menú" subtitle="Elegí días y comidas; usamos solo recetas aptas para tu perfil." />
      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        <Card className="h-fit space-y-6">
          <div>
            <div className="mb-2 text-sm font-semibold">Cantidad de días: {cantDias}</div>
            <input type="range" min={1} max={7} value={cantDias} onChange={(e) => setCantDias(+e.target.value)} className="w-full accent-primary" />
          </div>
          <div>
            <div className="mb-2 text-sm font-semibold">Comidas a incluir</div>
            <div className="flex flex-wrap gap-2">
              {TIPOS.map((t) => (
                <Chip key={t} active={comidas.includes(t)} onClick={() => setComidas(comidas.includes(t) ? comidas.filter((x) => x !== t) : [...comidas, t])}>
                  {comidaTexto[t]}
                </Chip>
              ))}
            </div>
          </div>
          <Button className="w-full" onClick={generar} disabled={!comidas.length}>
            {menu ? <RefreshCw className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
            {menu ? "Volver a generar" : "Generar menú"}
          </Button>
        </Card>

        <div>
          {!menu ? (
            <div className="grid h-full min-h-64 place-items-center rounded-2xl border border-dashed text-center text-muted-foreground">
              Configurá las opciones y generá tu menú.
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {menu.map((d) => (
                  <Card key={d.dia} className="p-4">
                    <div className="mb-3 font-display text-lg font-semibold">{d.dia}</div>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      {comidas.map((t) => {
                        const r = recetas.find((x) => x.id === d.comidas[t]);
                        return (
                          <div key={t} className="rounded-xl bg-secondary p-3">
                            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{comidaTexto[t]}</div>
                            {r ? (
                              <Link to="/recetas/$id" params={{ id: String(r.id) }} className="mt-1 block text-sm font-medium hover:text-primary">{r.nombre}</Link>
                            ) : (
                              <div className="mt-1 text-sm text-muted-foreground">Sin recetas aptas</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                ))}
              </div>
              <Card className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <input value={nombre} onChange={(e) => setNombre(e.target.value)} className="flex-1 rounded-full border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
                <Button onClick={() => { guardarMenu({ nombre, dias: menu }); navigate({ to: "/menus" }); }}>Guardar menú</Button>
              </Card>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
