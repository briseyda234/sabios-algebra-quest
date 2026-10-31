import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SabioX } from "@/components/game/SabioX";
import { MagicBackdrop } from "@/components/game/MagicBackdrop";
import { QuestButton } from "@/components/game/QuestButton";
import { Logo } from "@/components/game/Logo";

type Mode = "login" | "signup";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): { mode: Mode } => ({ mode: s["mode"] === "signup" ? "signup" : "login" }),
  head: () => ({
    meta: [
      { title: "Entrar a AlgebraQuest" },
      { name: "description", content: "Crea tu cuenta de estudiante o inicia sesión en AlgebraQuest." },
      { property: "og:title", content: "Entrar a AlgebraQuest" },
      { property: "og:description", content: "Registro e inicio de sesión de estudiantes." },
    ],
  }),
  component: AuthPage,
});

const inputCls =
  "h-12 w-full rounded-xl border-2 border-input bg-card px-4 text-base font-semibold outline-none transition focus:border-primary";

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const isSignup = mode === "signup";

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (isSignup) {
        if (name.trim().length < 2) throw new Error("Escribe tu nombre (mínimo 2 letras).");
        if (password.length < 6) throw new Error("La contraseña debe tener al menos 6 caracteres.");
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { name: name.trim() }, emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        if (!data.session) throw new Error("No se pudo iniciar la sesión. Intenta iniciar sesión.");
        toast.success(`¡Bienvenido, ${name.trim()}!`);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw new Error("Correo o contraseña incorrectos.");
      }
      navigate({ to: "/dashboard", replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Algo salió mal";
      const lower = msg.toLowerCase();
      toast.error(
        lower.includes("already registered")
          ? "Ese correo ya tiene una cuenta."
          : lower.includes("password")
            ? "Esa contraseña es muy común o débil. Elige otra más segura."
            : lower.includes("email")
              ? "Revisa que el correo electrónico sea válido."
              : msg,
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="relative flex min-h-screen flex-col bg-night-sky">
      <MagicBackdrop />
      <header className="relative z-10 mx-auto w-full max-w-5xl px-4 py-5 sm:px-8"><Logo /></header>
      <div className="relative z-10 mx-auto grid w-full max-w-5xl flex-1 items-center gap-6 px-4 pb-12 sm:px-8 md:grid-cols-2">
        <div className="hidden justify-center md:flex">
          <SabioX
            mood={isSignup ? "celebrating" : "thinking"}
            size="lg"
            bubbleSide="top"
            message={isSignup ? "¡Crea tu cuenta y comienza la aventura!" : "¡Qué gusto verte de nuevo!"}
          />
        </div>
        <form onSubmit={onSubmit} className="parchment mx-auto w-full max-w-md space-y-4 p-6 sm:p-8">
          <h1 className="text-2xl font-bold sm:text-3xl">{isSignup ? "Únete a la aventura" : "Iniciar sesión"}</h1>
          <p className="text-sm text-muted-foreground">
            {isSignup ? "Registro exclusivo para estudiantes." : "Continúa conquistando el álgebra."}
          </p>
          {isSignup && (
            <label className="block space-y-1">
              <span className="text-sm font-bold">Nombre</span>
              <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} required maxLength={40} autoComplete="name" />
            </label>
          )}
          <label className="block space-y-1">
            <span className="text-sm font-bold">Correo electrónico</span>
            <input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-bold">Contraseña</span>
            <input
              className={inputCls}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={isSignup ? "new-password" : "current-password"}
            />
          </label>
          <QuestButton type="submit" variant="primary" size="lg" className="w-full" disabled={busy}>
            {busy ? "Abriendo el portal…" : isSignup ? "Crear cuenta" : "Entrar"}
          </QuestButton>
          <button
            type="button"
            onClick={() => navigate({ to: "/auth", search: { mode: isSignup ? "login" : "signup" }, replace: true })}
            className="w-full text-center text-sm font-bold text-primary underline-offset-4 hover:underline"
          >
            {isSignup ? "¿Ya tienes cuenta? Inicia sesión" : "¿Eres nuevo? Crea tu cuenta"}
          </button>
        </form>
      </div>
    </main>
  );
}
