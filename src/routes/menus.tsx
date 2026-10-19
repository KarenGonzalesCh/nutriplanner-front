import { Link, createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Trash2 } from "lucide-react";
import { AppLayout } from "@/components/np/AppLayout";
import { Button, Card, PageHeader, comidaTexto } from "@/components/np/ui";
import { recetas } from "@/data/mock";
import { useApp } from "@/lib/app-state";
import type { TipoComida } from "@/types";

export const Route = createFileRoute("/menus")({
  head: () => ({
    meta: [
      { title: "Mis menús — NutriPlanner" },
      { name: "description", content: "Consultá los menús personalizados que guardaste." },
      { property: "og:title", content: "Mis menús — NutriPlanner" },
      { property: "og:description", content: "Consultá los menús personalizados que guardaste." },
    ],
  }),
  component: Menus,
});

function Menus() {
  const { menus, borrarMenu } = useApp();
  return (
    <AppLayout>
      <PageHeader title="Mis menús" subtitle={`${menus.length} menús guardados`}>
        <Link to="/generador"><Button>Nuevo menú</Button></Link>
      </PageHeader>
      {menus.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">Todavía no guardaste menús.</p>
      ) : (
        <div className="space-y-6">
          {menus.map((m) => (
            <Card key={m.id}>
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold">{m.nombre}</h2>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <CalendarDays className="h-4 w-4" />
                    {m.dias.length} días · creado el {new Date(m.creado).toLocaleDateString("es-AR")}
                  </p>
                </div>
                <Button variant="danger" onClick={() => borrarMenu(m.id)} aria-label="Eliminar menú"><Trash2 className="h-4 w-4" /></Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-sm">
                  <tbody className="divide-y">
                    {m.dias.map((d) => (
                      <tr key={d.dia}>
                        <td className="w-28 py-2.5 font-semibold">{d.dia}</td>
                        {(Object.entries(d.comidas) as [TipoComida, number][]).map(([t, id]) => {
                          const r = recetas.find((x) => x.id === id);
                          return (
                            <td key={t} className="py-2.5 pr-4">
                              <div className="text-xs text-muted-foreground">{comidaTexto[t]}</div>
                              {r && <Link to="/recetas/$id" params={{ id: String(r.id) }} className="font-medium hover:text-primary">{r.nombre}</Link>}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
