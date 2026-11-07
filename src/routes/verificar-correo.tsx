
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Leaf,
  LoaderCircle,
} from "lucide-react";
import { api, ApiError, getErrorMessage } from "@/services/api";

export const Route = createFileRoute("/verificar-correo")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search["token"] === "string" ? search["token"] : "",
  }),
  head: () => ({
    meta: [
      { title: "NutriPlanner — Verificar correo electrónico" },
    ],
  }),
  component: VerificarCorreo,
});

type EstadoVerificacion = "verificando" | "exito" | "error";

function VerificarCorreo() {
  const { token } = Route.useSearch();

  const [estado, setEstado] = useState<EstadoVerificacion>(
    "verificando"
  );
  const [mensaje, setMensaje] = useState("");

  // Evita confirmar dos veces el mismo token
  // si React ejecuta nuevamente el efecto.
  const tokenProcesado = useRef<string | null>(null);

  useEffect(() => {
    if (tokenProcesado.current === token) return;

    tokenProcesado.current = token;

    if (!token) {
      setEstado("error");
      setMensaje(
        "El enlace no contiene un token de verificación válido."
      );
      return;
    }

    setEstado("verificando");
    setMensaje("");

    api.verificarCorreo(token)
      .then(() => {
        if (tokenProcesado.current !== token) return;

        setEstado("exito");
        setMensaje(
          "Tu correo electrónico fue verificado correctamente."
        );
      })
      .catch((err: unknown) => {
        if (tokenProcesado.current !== token) return;

        setEstado("error");

        if (err instanceof ApiError && err.status === 400) {
          setMensaje(
            "El enlace es inválido, ya fue utilizado o venció. " +
            "Volvé al inicio de sesión para solicitar uno nuevo."
          );
        } else {
          setMensaje(
            getErrorMessage(
              err,
              "No se pudo verificar el correo electrónico."
            )
          );
        }
      });
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-hero px-6 py-12">
      <div className="w-full max-w-md rounded-3xl border bg-card p-8 text-center shadow-sm">

        <div className="mb-8 flex items-center justify-center gap-2 text-2xl font-semibold">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground">
            <Leaf className="h-5 w-5" />
          </span>
          NutriPlanner
        </div>

        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
          {estado === "verificando" && (
            <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
          )}

          {estado === "exito" && (
            <CheckCircle2 className="h-8 w-8 text-primary" />
          )}

          {estado === "error" && (
            <AlertCircle className="h-8 w-8 text-destructive" />
          )}
        </div>

        <h1 className="text-2xl font-semibold">
          {estado === "verificando"
            ? "Verificando tu correo..."
            : estado === "exito"
              ? "¡Correo verificado!"
              : "No pudimos verificar tu correo"}
        </h1>

        <p
          role="status"
          className="mt-4 text-sm text-muted-foreground"
        >
          {estado === "verificando"
            ? "Estamos comprobando tu enlace de confirmación."
            : mensaje}
        </p>

        {estado !== "verificando" && (
          <Link
            to="/"
            className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Volver a iniciar sesión
          </Link>
        )}

      </div>
    </div>
  );
}
