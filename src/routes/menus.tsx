
import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  CalendarDays,
  Plus,
  Trash2,
  Utensils,
  Repeat,
} from "lucide-react";

import { AppLayout } from "@/components/np/AppLayout";
import {
  Button,
  Card,
  PageHeader,
  comidaTexto,
} from "@/components/np/ui";
import { useApp } from "@/lib/app-state";
import { getErrorMessage } from "@/services/api";
import type { TipoComida } from "@/types";

export const Route = createFileRoute("/menus")({
  component: Menus,
});

function Menus() {
  const { menus, borrarMenu, cargandoSesion } = useApp();

  const [eliminandoId, setEliminandoId] =
    useState<number | null>(null);

  const eliminar = async (id: number) => {
    if (!window.confirm("¿Querés eliminar este menú?")) {
      return;
    }

    setEliminandoId(id);

    try {
      await borrarMenu(id);
      toast.success("Menú eliminado correctamente.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setEliminandoId(null);
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Mis menús"
        subtitle={`${menus.length} ${
          menus.length === 1
            ? "menú guardado"
            : "menús guardados"
        }`}
      >
        <Link to="/generador">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo menú
          </Button>
        </Link>
      </PageHeader>

      {cargandoSesion ? (
        <Card className="p-8 text-center">
          Cargando tus menús...
        </Card>
      ) : menus.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/50 px-4 py-16 text-center">
          <CalendarDays className="mb-4 h-12 w-12 text-primary" />

          <h2 className="font-display text-xl font-bold">
            Todavía no guardaste ningún menú
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Generá tu primer menú personalizado.
          </p>

          <Link to="/generador" className="mt-6">
            <Button>
              <Plus className="h-4 w-4" />
              Crear mi primer menú
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {menus.map((menu) => (
            <Card
              key={menu.id}
              className="space-y-5 p-5 shadow-card sm:p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl font-bold">
                    {menu.nombre}
                  </h2>

                  <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays className="h-4 w-4" />

                    {menu.dias.length} días · Creado el{" "}
                    {new Date(menu.creado).toLocaleDateString(
                      "es-AR"
                    )}
                  </p>
                </div>

                <Button
                  variant="danger"
                  disabled={eliminandoId !== null}
                  onClick={() => void eliminar(menu.id)}
                  aria-label="Eliminar menú"
                  title="Eliminar menú"
                  className="h-9 w-9 rounded-xl p-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-5">
                {menu.dias.map((dia, indice) => {
                  const comidasDia = Object.entries(
                    dia.comidas
                  ) as [TipoComida, number][];

                  return (
                    <div
                      key={`${menu.id}-${indice}`}
                      className="space-y-3 rounded-2xl border border-border/60 bg-secondary/20 p-4"
                    >
                      <h3 className="font-display text-lg font-bold">
                        {dia.dia}
                      </h3>

                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        {comidasDia.map(([tipo, recetaId]) => {
                          const instantanea =
                            dia.instantaneas?.[tipo];

                          const sustituidos =
                            instantanea?.ingredientes.filter(
                              (ingrediente) =>
                                ingrediente.sustitucion !== null
                            ) ?? [];

                          return (
                            <div
                              key={tipo}
                              className="rounded-xl border border-border bg-card p-4 shadow-sm"
                            >
                              <p className="text-xs font-bold uppercase text-muted-foreground">
                                {comidaTexto[tipo]}
                              </p>

                              <div className="mt-2 flex items-start gap-2">
                                <Utensils className="mt-1 h-4 w-4 shrink-0 text-primary" />

                                <h4 className="font-semibold">
                                  {instantanea?.nombre_receta ??
                                    `Receta #${recetaId}`}
                                </h4>
                              </div>

                              {sustituidos.length > 0 && (
                                <div className="mt-3 space-y-1 rounded-lg bg-primary/10 p-2">
                                  <p className="flex items-center gap-1 text-xs font-semibold text-primary">
                                    <Repeat className="h-3.5 w-3.5" />
                                    Sustituciones guardadas
                                  </p>

                                  {sustituidos.map(
                                    (ingrediente, i) => (
                                      <p
                                        key={i}
                                        className="text-xs text-foreground"
                                      >
                                        {
                                          ingrediente.sustitucion
                                            ?.nombre_original
                                        }
                                        {" → "}
                                        {ingrediente.nombre}
                                      </p>
                                    )
                                  )}
                                </div>
                              )}

                              {instantanea ? (
                                <details className="mt-4 text-sm">
                                  <summary className="cursor-pointer font-medium text-primary">
                                    Ver ingredientes y preparación
                                  </summary>

                                  <div className="mt-3 space-y-3">
                                    <div>
                                      <p className="font-semibold">
                                        Ingredientes
                                      </p>

                                      <ul className="mt-2 space-y-1">
                                        {instantanea.ingredientes.map(
                                          (ingrediente, i) => (
                                            <li
                                              key={i}
                                              className="text-xs text-muted-foreground"
                                            >
                                              {ingrediente.nombre}
                                              {" — "}
                                              {ingrediente.cantidad}
                                              {" "}
                                              {ingrediente.unidad}
                                            </li>
                                          )
                                        )}
                                      </ul>
                                    </div>

                                    <div>
                                      <p className="font-semibold">
                                        Preparación
                                      </p>

                                      <p className="mt-2 whitespace-pre-line text-xs text-muted-foreground">
                                        {instantanea.pasos}
                                      </p>
                                    </div>
                                  </div>
                                </details>
                              ) : (
                                <p className="mt-3 text-xs text-muted-foreground">
                                  El detalle histórico de esta
                                  comida no está disponible.
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
