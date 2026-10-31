import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { checkAnswer, fetchLevelQuestions, fetchLevels, submitLevel } from "@/services/game";
import { AppShell, Stars } from "@/components/game/AppShell";
import { SabioX, SABIO_MESSAGES, type SabioMood } from "@/components/game/SabioX";
import { QuestButton, questButton } from "@/components/game/QuestButton";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/level/$levelId")({
  head: ({ params }) => ({
    meta: [
      { title: `Nivel ${params.levelId} — AlgebraQuest` },
      { name: "description", content: "Resuelve los desafíos de álgebra de este nivel junto a Sabio X." },
      { property: "og:title", content: `Nivel ${params.levelId} — AlgebraQuest` },
      { property: "og:description", content: "Ejercicios interactivos de álgebra." },
    ],
  }),
  component: LevelPage,
});

type Feedback = { is_correct: boolean; correct_option_id: string; explanation: string };
type Result = { correct_count: number; total_questions: number; points: number; stars: number; percentage: number; completed: boolean };

function LevelPage() {
  const levelId = Number(Route.useParams().levelId);
  const qc = useQueryClient();
  const levels = useQuery({ queryKey: ["levels"], queryFn: fetchLevels });
  const questions = useQuery({ queryKey: ["questions", levelId], queryFn: () => fetchLevelQuestions(levelId) });

  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [answers, setAnswers] = useState<{ question_id: string; option_id: string }[]>([]);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const level = levels.data?.find((l) => l.id === levelId);
  const qs = questions.data ?? [];
  const q = qs[idx];

  async function choose(optionId: string) {
    if (feedback || checking || !q) return;
    setSelected(optionId);
    setChecking(true);
    try {
      const fb = await checkAnswer(q.id, optionId);
      setFeedback(fb);
    } catch (e) {
      setSelected(null);
      toast.error(e instanceof Error && e.message.includes("bloqueado") ? "Este nivel aún está bloqueado." : "No se pudo comprobar la respuesta.");
    } finally {
      setChecking(false);
    }
  }

  async function next() {
    if (!q || !selected || !feedback) return;
    const all = [...answers, { question_id: q.id, option_id: selected }];
    setAnswers(all);
    if (idx + 1 < qs.length) {
      setIdx(idx + 1);
      setSelected(null);
      setFeedback(null);
      return;
    }
    setSubmitting(true);
    try {
      const r = await submitLevel(levelId, all);
      setResult(r);
      qc.invalidateQueries({ queryKey: ["adventure"] });
    } catch {
      toast.error("No se pudo guardar tu resultado. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  function restart() {
    setIdx(0); setSelected(null); setFeedback(null); setAnswers([]); setResult(null);
  }

  if (questions.isLoading || levels.isLoading) {
    return <AppShell><p className="py-20 text-center font-bold">Preparando el desafío…</p></AppShell>;
  }
  if (!level || qs.length === 0) {
    return (
      <AppShell>
        <div className="parchment mx-auto max-w-md p-8 text-center">
          <p className="font-bold">Este nivel no existe.</p>
          <Link to="/map" className={cn(questButton({ size: "sm" }), "mt-4")}>Volver al mapa</Link>
        </div>
      </AppShell>
    );
  }

  if (!q) return null;
  if (result) return <AppShell><Results level={level.title} r={result} onRetry={restart} /></AppShell>;

  const mood: SabioMood = !feedback ? "thinking" : feedback.is_correct ? "happy" : "motivating";
  const message = !feedback
    ? idx === 0 ? SABIO_MESSAGES.cheer : "Lee con calma y elige tu respuesta."
    : feedback.is_correct ? SABIO_MESSAGES.correct : SABIO_MESSAGES.wrong;
  const progress = ((idx + (feedback ? 1 : 0)) / qs.length) * 100;

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-xl font-bold sm:text-2xl">Nivel {level.id}: {level.title}</h1>
          <span className="rounded-full bg-lavender/15 px-3 py-1 text-sm font-extrabold">Pregunta {idx + 1} de {qs.length}</span>
        </div>
        <div className="mb-6 h-3 overflow-hidden rounded-full bg-lavender/20">
          <div className="h-full rounded-full bg-gold-gradient transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

        <SabioX mood={mood} message={message} size="sm" className="mb-5" />

        <div className="parchment p-5 sm:p-7">
          <p className="mb-5 text-lg font-extrabold sm:text-xl">{q.prompt}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {q.options.map((o, i) => {
              const isSel = selected === o.id;
              const isRight = feedback?.correct_option_id === o.id;
              return (
                <button
                  key={o.id}
                  onClick={() => choose(o.id)}
                  disabled={!!feedback || checking}
                  className={cn(
                    "flex min-h-14 items-center gap-3 rounded-2xl border-2 bg-card px-4 py-3 text-left text-base font-bold transition-all",
                    !feedback && "border-primary/25 shadow-[0_4px_0_var(--border)] hover:-translate-y-0.5 hover:border-primary",
                    isSel && !feedback && "border-primary bg-secondary",
                    feedback && isRight && "border-emerald bg-emerald/15",
                    feedback && isSel && !isRight && "border-destructive bg-destructive/10",
                    feedback && !isSel && !isRight && "opacity-60",
                  )}
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary font-display text-sm text-primary-foreground">
                    {"ABCD"[i]}
                  </span>
                  <span className="break-words">{o.label}</span>
                </button>
              );
            })}
          </div>

          {feedback && (
            <div className={cn("mt-5 animate-pop rounded-2xl border-2 p-4",
              feedback.is_correct ? "border-emerald bg-emerald/10" : "border-gold bg-gold/15")}>
              <p className="font-display font-bold">{feedback.is_correct ? "¡Correcto!" : "Respuesta incorrecta"}</p>
              <p className="mt-1 text-sm sm:text-base">{feedback.explanation}</p>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <QuestButton onClick={next} disabled={!feedback || submitting} size="lg" className="w-full sm:w-auto">
              {submitting ? "Guardando…" : idx + 1 === qs.length ? "Ver resultados" : "Continuar"}
            </QuestButton>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Results({ level, r, onRetry }: { level: string; r: Result; onRetry: () => void }) {
  const msg = r.stars === 3 ? SABIO_MESSAGES.levelDone : r.completed ? SABIO_MESSAGES.close : SABIO_MESSAGES.wrong + " ¡Inténtalo otra vez!";
  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex justify-center">
        <SabioX mood={r.completed ? "celebrating" : "motivating"} size="md" bubbleSide="top" message={msg} />
      </div>
      <div className="parchment mt-6 p-6 text-center sm:p-8">
        <p className="text-sm font-extrabold uppercase tracking-wider text-primary">Resultados</p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{level}</h1>
        <div className="my-4 animate-pop"><Stars count={r.stars} size="text-5xl" /></div>
        <div className="grid grid-cols-3 gap-3">
          <Box label="Correctas" value={`${r.correct_count}/${r.total_questions}`} />
          <Box label="Puntos" value={r.points} />
          <Box label="Aciertos" value={`${r.percentage}%`} />
        </div>
        {!r.completed && (
          <p className="mt-4 text-sm font-bold text-muted-foreground">Necesitas al menos 3 respuestas correctas para desbloquear el siguiente nivel.</p>
        )}
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <QuestButton variant="gold" onClick={onRetry}>Repetir nivel</QuestButton>
          <Link to="/dashboard" className={questButton({ variant: "primary" })}>Regresar al panel</Link>
        </div>
      </div>
    </div>
  );
}

function Box({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-secondary p-3">
      <p className="font-display text-xl font-black text-primary sm:text-2xl">{value}</p>
      <p className="text-xs font-bold text-muted-foreground">{label}</p>
    </div>
  );
}
