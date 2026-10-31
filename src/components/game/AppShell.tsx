import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "./Logo";
import { MagicBackdrop } from "./MagicBackdrop";

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const qc = useQueryClient();

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", search: { mode: "login" }, replace: true });
  }

  const link = "rounded-xl px-3 py-2 text-sm font-extrabold text-lavender/80 transition hover:bg-lavender/10 hover:text-lavender";
  const active = { className: "bg-lavender/15 text-gold" };

  return (
    <div className="relative min-h-screen bg-night-sky text-night-foreground">
      <MagicBackdrop className="fixed" />
      <header className="relative z-10 mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-8">
        <Logo />
        <nav className="flex items-center gap-1">
          <Link to="/dashboard" className={link} activeProps={active}>Panel</Link>
          <Link to="/map" className={link} activeProps={active}>Mapa</Link>
          <button onClick={signOut} className={link}>Salir</button>
        </nav>
      </header>
      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-16 sm:px-8">{children}</main>
    </div>
  );
}

export function Stars({ count, size = "text-2xl" }: { count: number; size?: string }) {
  return (
    <span className={size} aria-label={`${count} de 3 estrellas`}>
      {[1, 2, 3].map((i) => (
        <span key={i} className={i <= count ? "text-gold" : "text-muted-foreground/40"}>★</span>
      ))}
    </span>
  );
}
