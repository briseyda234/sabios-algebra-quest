import { Link } from "@tanstack/react-router";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="grid size-10 place-items-center rounded-xl bg-gold-gradient font-display text-xl font-black text-gold-foreground shadow-[0_4px_0_var(--gold-deep)]">
        x
      </span>
      <span className="font-display text-lg font-bold text-night-foreground sm:text-xl">
        Algebra<span className="text-gold">Quest</span>
      </span>
    </Link>
  );
}
