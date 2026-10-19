import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppLayout } from "@/components/np/AppLayout";
import { PerfilForm } from "@/components/np/PerfilForm";
import { PageHeader } from "@/components/np/ui";
import { useApp } from "@/lib/app-state";
import { api } from "@/services/api";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Configurá tu perfil — NutriPlanner" },
      { name: "description", content: "Declarás alergias, alimentos a evitar y nivel culinario." },
      { property: "og:title", content: "Configurá tu perfil — NutriPlanner" },
      { property: "og:description", content: "Declarás alergias, alimentos a evitar y nivel culinario." },
    ],
  }),
  component: Onboarding,
});

function Onboarding() {
  const { perfil, setPerfil, cuenta } = useApp();
  const navigate = useNavigate();
  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl">
        <PageHeader title={`Hola, ${cuenta?.nombre_usuario ?? ""}`} subtitle="Contanos cómo comés para personalizar tus recetas y menús." />
        <PerfilForm
          inicial={perfil}
          textoBoton="Guardar y continuar"
          onGuardar={async (p) => {
            setPerfil(await api.guardarPerfil(p));
            navigate({ to: "/recetas" });
          }}
        />
      </div>
    </AppLayout>
  );
}
