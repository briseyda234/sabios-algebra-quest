import { supabase } from "@/integrations/supabase/client";
import level1 from "@/assets/level-1.png";
import level2 from "@/assets/level-2.png";
import level3 from "@/assets/level-3.png";
import level4 from "@/assets/level-4.png";

export const LEVEL_ART: Record<number, string> = { 1: level1, 2: level2, 3: level3, 4: level4 };

export type LevelStatus = "locked" | "available" | "completed";

export interface Level { id: number; title: string; description: string; topics: string[] }
export interface Progress { level_id: number; best_correct: number; best_points: number; best_stars: number; attempts: number; completed: boolean }
export interface Attempt { id: string; level_id: number; correct_count: number; total_questions: number; points: number; stars: number; percentage: number; created_at: string }
export interface QuizQuestion { id: string; position: number; prompt: string; options: { id: string; label: string }[] }

function must<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}

export async function fetchProfile() {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) throw new Error("No autenticado");
  return must(await supabase.from("profiles").select("id, display_name").eq("id", u.user.id).single());
}

export async function fetchLevels(): Promise<Level[]> {
  return must(await supabase.from("levels").select("id, title, description, topics").order("id"));
}

export async function fetchProgress(): Promise<Progress[]> {
  return must(await supabase.from("level_progress").select("level_id, best_correct, best_points, best_stars, attempts, completed"));
}

export async function fetchRecentAttempts(limit = 5): Promise<Attempt[]> {
  return must(
    await supabase
      .from("level_attempts")
      .select("id, level_id, correct_count, total_questions, points, stars, percentage, created_at")
      .order("created_at", { ascending: false })
      .limit(limit),
  );
}

export async function fetchLevelQuestions(levelId: number): Promise<QuizQuestion[]> {
  const rows = must(
    await supabase
      .from("questions")
      .select("id, position, prompt, question_options(id, label, position)")
      .eq("level_id", levelId)
      .eq("active", true)
      .order("position"),
  );
  return rows.map((q) => ({
    id: q.id,
    position: q.position,
    prompt: q.prompt,
    options: [...q.question_options].sort((a, b) => a.position - b.position).map(({ id, label }) => ({ id, label })),
  }));
}

/** Server-side check of a single answer. */
export async function checkAnswer(questionId: string, optionId: string) {
  const rows = must(await supabase.rpc("check_answer", { _question_id: questionId, _option_id: optionId }));
  return rows[0];
}

/** Server grades the whole level, stores the attempt and updates best progress. */
export async function submitLevel(levelId: number, answers: { question_id: string; option_id: string }[]) {
  const rows = must(await supabase.rpc("submit_level", { _level_id: levelId, _answers: answers }));
  return rows[0];
}

export function levelStatuses(levels: Level[], progress: Progress[]): Record<number, LevelStatus> {
  const done = new Set(progress.filter((p) => p.completed).map((p) => p.level_id));
  const out: Record<number, LevelStatus> = {};
  levels.forEach((l, i) => {
    out[l.id] = done.has(l.id) ? "completed" : i === 0 || done.has(levels[i - 1].id) ? "available" : "locked";
  });
  return out;
}

export async function loadAdventure() {
  const [profile, levels, progress, attempts] = await Promise.all([
    fetchProfile(),
    fetchLevels(),
    fetchProgress(),
    fetchRecentAttempts(),
  ]);
  const statuses = levelStatuses(levels, progress);
  const completed = levels.filter((l) => statuses[l.id] === "completed").length;
  const points = progress.reduce((s, p) => s + p.best_points, 0);
  const current = levels.find((l) => statuses[l.id] === "available") ?? levels[levels.length - 1];
  return {
    profile, levels, progress, attempts, statuses, completed, points, current,
    percent: levels.length ? Math.round((completed / levels.length) * 100) : 0,
  };
}
