import { cn } from "@/lib/utils";

const SYMBOLS = ["x", "+", "y²", "−", "=", "a", "÷", "3x", "×", "b"];

/** Starry sky, floating math symbols and light particles. Purely decorative. */
export function MagicBackdrop({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {Array.from({ length: 28 }).map((_, i) => (
        <span
          key={`s${i}`}
          className="absolute size-1 rounded-full bg-gold animate-twinkle"
          style={{
            left: `${(i * 37) % 100}%`,
            top: `${(i * 53) % 70}%`,
            animationDelay: `${(i % 7) * 0.4}s`,
          }}
        />
      ))}
      {SYMBOLS.map((s, i) => (
        <span
          key={s + i}
          className="absolute bottom-0 font-display text-2xl font-bold text-lavender/40 animate-drift sm:text-3xl"
          style={{
            left: `${5 + i * 9.5}%`,
            animationDuration: `${14 + (i % 4) * 4}s`,
            animationDelay: `${i * 1.6}s`,
          }}
        >
          {s}
        </span>
      ))}
    </div>
  );
}
