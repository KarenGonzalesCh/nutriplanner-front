import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Leaf } from "lucide-react";
import hero from "@/assets/receta-quinoa.jpg";
import { Button, Input } from "@/components/np/ui";
import { useApp } from "@/lib/app-state";
import { api } from "@/services/api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NutriPlanner — Iniciar sesión" },
      { name: "description", content: "Planificá tus comidas según tus alergias, preferencias y nivel culinario." },
      { property: "og:title", content: "NutriPlanner — Planificación alimentaria personalizada" },
      { property: "og:description", content: "Planificá tus comidas según tus alergias, preferencias y nivel culinario." },
    ],
  }),
  component: Acceso,
});

function Acceso() {
  const [modo, setModo] = useState<"login" | "registro">("login");
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const { iniciarSesion } = useApp();
  const navigate = useNavigate();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setCargando(true);
    const res = modo === "login" ? await api.login(correo, password) : await api.registro(nombre, correo, password);
    iniciarSesion(res.cuenta, res.token);
    setCargando(false);
    navigate({ to: modo === "registro" ? "/onboarding" : "/recetas" });
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <img src={hero} alt="Bowl de quinoa saludable" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent" />
        <div className="absolute bottom-12 left-12 right-12 text-primary-foreground">
          <h2 className="text-4xl font-semibold leading-tight">Comer bien, sin pensar en lo que no podés comer.</h2>
          <p className="mt-3 opacity-90">Menús que respetan tus alergias, gustos y tiempo en la cocina.</p>
        </div>
      </div>

      <div className="flex items-center justify-center bg-hero px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 font-display text-2xl font-semibold">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground"><Leaf className="h-5 w-5" /></span>
            NutriPlanner
          </div>
          <h1 className="text-3xl font-semibold">{modo === "login" ? "Bienvenido de nuevo" : "Creá tu cuenta"}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {modo === "login" ? "Ingresá para ver tus recetas y menús." : "En dos minutos configurás tu perfil alimentario."}
          </p>

          <div className="mt-6 grid grid-cols-2 rounded-full bg-secondary p-1 text-sm font-medium">
            {(["login", "registro"] as const).map((m) => (
              <button key={m} type="button" onClick={() => setModo(m)} className={`rounded-full py-2 transition ${modo === m ? "bg-card shadow-card" : "text-muted-foreground"}`}>
                {m === "login" ? "Iniciar sesión" : "Registrarse"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {modo === "registro" && <Input label="Nombre de usuario" required value={nombre} onChange={(e) => setNombre(e.target.value)} />}
            <Input label="Correo electrónico" type="email" required value={correo} onChange={(e) => setCorreo(e.target.value)} />
            <Input label="Contraseña" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
            <Button type="submit" className="w-full" disabled={cargando}>
              {cargando ? "Cargando…" : modo === "login" ? "Ingresar" : "Crear cuenta"}
            </Button>
          </form>
          <p className="mt-6 text-center text-xs text-muted-foreground">Versión de demostración: cualquier correo y contraseña funcionan.</p>
        </div>
      </div>
    </div>
  );
}
