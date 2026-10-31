import happy from "@/assets/owl-happy.png";
import thinking from "@/assets/owl-thinking.png";
import surprised from "@/assets/owl-surprised.png";
import celebrating from "@/assets/owl-celebrating.png";
import motivating from "@/assets/owl-motivating.png";
import { cn } from "@/lib/utils";

export type SabioMood = "happy" | "thinking" | "surprised" | "celebrating" | "motivating";

const IMAGES: Record<SabioMood, string> = { happy, thinking, surprised, celebrating, motivating };

export const SABIO_MESSAGES = {
  correct: "¡Excelente! ¡Has dominado este desafío!",
  cheer: "¡Vamos, tú puedes lograrlo!",
  wrong: "No te preocupes, equivocarse también es aprender.",
  close: "¡Estás cada vez más cerca de conquistar el álgebra!",
  levelDone: "¡Felicidades, has completado este nivel!",
};

interface Props {
  mood: SabioMood;
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  bubbleSide?: "right" | "top";
}

const SIZES = { sm: "w-20 sm:w-24", md: "w-28 sm:w-36", lg: "w-48 sm:w-64 lg:w-80" };

export function SabioX({ mood, message, size = "md", className, bubbleSide = "right" }: Props) {
  return (
    <div
      className={cn(
        "flex items-center gap-3",
        bubbleSide === "top" && "flex-col-reverse",
        className,
      )}
    >
      <img
        key={mood}
        src={IMAGES[mood]}
        alt={`Sabio X ${mood}`}
        width={816}
        height={816}
        className={cn(SIZES[size], "h-auto shrink-0 animate-pop drop-shadow-xl")}
      />
      {message && (
        <div className="parchment animate-pop px-4 py-3 text-sm font-bold sm:text-base">
          <span className="mb-0.5 block font-display text-xs tracking-wider text-primary">Sabio X</span>
          {message}
        </div>
      )}
    </div>
  );
}
