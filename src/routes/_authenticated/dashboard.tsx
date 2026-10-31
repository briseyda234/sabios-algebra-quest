import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { loadAdventure } from "@/services/game";
import { AppShell, Stars } from "@/components/game/AppShell";
import { SabioX, SABIO_MESSAGES } from "@/components/game/SabioX";
import { questButton } from "@/components/game/QuestButton";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Mi panel — AlgebraQuest" },
      { name: "description", content: "Tus puntos, progreso y últimos resultados en AlgebraQuest." },
      { property: "og:title", content: "Mi panel — AlgebraQuest" },
      { property: "og:description", content: "Revisa tu progreso en la Isla de las Variables." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { data, isLoading, error } = useQuery({ queryKey: ["adventure"], queryFn: loadAdventure });

  return (
    <AppShell>
      {isLoading && <p className="py-20 text-center font-bold">Cargando tu aventura…</p>}
      {error && <p className="parchment p-6 text-center">No pudimos cargar tus datos. Recarga la página.</p>}
      {data && (
        <div className="space-y-6">
          <section className="glass-panel flex flex-col items-center gap-5 p-5 sm:flex-row sm:p-7">
            <div className="grid size-20 shrink-0 place-items-center rounded-full bg-gold-gradient font-display text-3xl font-black text-gold-foreground ring-4 ring-lavender/30">
              {(data.profile?.display_name ?? "Aventurero").charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <p className="text-sm font-bold text-lavender/70">Bienvenido de nuevo,</p>
              <h1 className="break-words text-2xl font-bold sm:text-3xl">{(data.profile?.display_name ?? "Aventurero")}</h1>
              <p className="mt-1 text-sm text-gold">
                Nivel actual: {data.current ? `${data.current.id}. ${data.current.title}` : "—"}
              </p>
            </div>
            <Link to="/map" className={questButton({ variant: "gold", size: "lg" })}>Continuar aventura</Link>
          </section>

          <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Stat label="Puntos" value={data.points} />
            <Stat label="Progreso" value={`${data.percent}%`} />
            <Stat label="Niveles completos" value={`${data.completed}/${data.levels.length}`} />
            <Stat label="Nivel actual" value={data.current?.id ?? "—"} />
          </section>

          <div className="parchment p-5">
            <div className="mb-2 flex justify-between text-sm font-bold">
              <span>Progreso en la Isla de las Variables</span><span>{data.percent}%</span>
            </div>
            <div className="h-4 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-emerald transition-all" style={{ width: `${data.percent}%` }} />
            </div>
          </div>

          <section className="grid gap-6 lg:grid-cols-[1fr_auto]">
            <div className="parchment p-5 sm:p-6">
              <h2 className="mb-4 text-xl font-bold">Últimos resultados</h2>
              {data.attempts.length === 0 ? (
                <p className="text-muted-foreground">Aún no has completado ningún desafío. ¡Tu aventura te espera!</p>
              ) : (
                <ul className="divide-y divide-border">
                  {data.attempts.map((a) => (
                    <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                      <div>
                        <p className="font-extrabold">Nivel {a.level_id}: {data.levels.find((l) => l.id === a.level_id)?.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {a.correct_count}/{a.total_questions} correctas · {a.points} pts · {new Date(a.created_at).toLocaleDateString("es-MX")}
                        </p>
                      </div>
                      <Stars count={a.stars} size="text-xl" />
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex justify-center lg:w-72">
              <SabioX
                mood={data.completed === data.levels.length ? "celebrating" : "motivating"}
                bubbleSide="top"
                message={data.completed === data.levels.length ? "¡Conquistaste toda la isla!" : SABIO_MESSAGES.close}
              />
            </div>
          </section>
        </div>
      )}
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="parchment p-4 text-center">
      <p className="font-display text-2xl font-black text-primary sm:text-3xl">{value}</p>
      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground sm:text-sm">{label}</p>
    </div>
  );
}
