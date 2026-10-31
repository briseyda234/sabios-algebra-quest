import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { LEVEL_ART, loadAdventure, type LevelStatus } from "@/services/game";
import { AppShell, Stars } from "@/components/game/AppShell";
import { SabioX } from "@/components/game/SabioX";
import { questButton } from "@/components/game/QuestButton";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/map")({
  head: () => ({
    meta: [
      { title: "Mapa: Isla de las Variables — AlgebraQuest" },
      { name: "description", content: "Explora los niveles de la Isla de las Variables y desbloquea nuevos desafíos." },
      { property: "og:title", content: "Mapa de aventura — AlgebraQuest" },
      { property: "og:description", content: "Los niveles de álgebra de la Isla de las Variables." },
    ],
  }),
  component: MapPage,
});

const STATUS_LABEL: Record<LevelStatus, string> = { locked: "🔒 Bloqueado", available: "✨ Disponible", completed: "✅ Completado" };

function MapPage() {
  const { data, isLoading } = useQuery({ queryKey: ["adventure"], queryFn: loadAdventure });

  return (
    <AppShell>
      <div className="mb-8 flex flex-col items-center gap-4 text-center md:flex-row md:text-left">
        <div className="flex-1">
          <h1 className="text-glow text-3xl font-black sm:text-4xl">Isla de las Variables</h1>
          <p className="mt-2 text-lavender/80">Completa cada nivel con al menos 3 respuestas correctas para abrir el siguiente camino.</p>
        </div>
        <SabioX mood="thinking" size="sm" />
      </div>

      {isLoading && <p className="py-20 text-center font-bold">Desplegando el mapa…</p>}

      {data && (
        <ol className="relative mx-auto max-w-3xl space-y-10">
          {/* winding path */}
          <div aria-hidden className="absolute bottom-10 left-1/2 top-10 hidden w-1 -translate-x-1/2 border-l-4 border-dashed border-gold/50 sm:block" />
          {data.levels.map((lvl, i) => {
            const status: LevelStatus = data.statuses[lvl.id] ?? "locked";
            const prog = data.progress.find((p) => p.level_id === lvl.id);
            const right = i % 2 === 1;
            return (
              <li key={lvl.id} className={cn("relative flex flex-col items-center gap-3 sm:flex-row", right && "sm:flex-row-reverse")}>
                <div className={cn("relative w-40 shrink-0 sm:w-48", status === "locked" ? "opacity-50 grayscale" : "animate-float")}
                     style={{ animationDelay: `${i * 0.7}s` }}>
                  <img src={LEVEL_ART[lvl.id]} alt={lvl.title} width={816} height={816} loading="lazy" className="h-auto w-full drop-shadow-2xl" />
                  <span className="absolute left-1 top-1 grid size-11 place-items-center rounded-full bg-gold-gradient font-display text-xl font-black text-gold-foreground shadow-[0_4px_0_var(--gold-deep)]">
                    {lvl.id}
                  </span>
                </div>
                <div className="parchment w-full flex-1 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-primary">Nivel {lvl.id}</span>
                    <span className={cn("rounded-full px-3 py-1 text-xs font-extrabold",
                      status === "completed" ? "bg-emerald/20 text-emerald-deep" : status === "available" ? "bg-gold/30 text-gold-foreground" : "bg-muted text-muted-foreground")}>
                      {STATUS_LABEL[status]}
                    </span>
                  </div>
                  <h2 className="mt-1 text-xl font-bold">{lvl.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{lvl.description}</p>
                  <div className="mt-3">
                    <div className="mb-1 flex justify-between text-xs font-bold">
                      <span>Mejor: {prog?.best_correct ?? 0}/5 correctas</span>
                      <Stars count={prog?.best_stars ?? 0} size="text-base" />
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-emerald" style={{ width: `${((prog?.best_correct ?? 0) / 5) * 100}%` }} />
                    </div>
                  </div>
                  <div className="mt-4">
                    {status === "locked" ? (
                      <span className={questButton({ variant: "outline", size: "sm" }) + " pointer-events-none opacity-60"}>Completa el nivel anterior</span>
                    ) : (
                      <Link to="/level/$levelId" params={{ levelId: String(lvl.id) }}
                            className={questButton({ variant: status === "completed" ? "emerald" : "primary", size: "sm" })}>
                        {status === "completed" ? "Repetir nivel" : "Jugar"}
                      </Link>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </AppShell>
  );
}
