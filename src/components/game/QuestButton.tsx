import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const questButton = cva(
  "inline-flex items-center justify-center gap-2 rounded-2xl font-sans font-extrabold transition-all duration-150 select-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:translate-y-0 active:translate-y-1 hover:-translate-y-0.5",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground shadow-[0_6px_0_var(--primary-deep)] active:shadow-[0_2px_0_var(--primary-deep)]",
        gold: "bg-gold-gradient text-gold-foreground shadow-[0_6px_0_var(--gold-deep)] active:shadow-[0_2px_0_var(--gold-deep)]",
        emerald: "bg-emerald text-night shadow-[0_6px_0_var(--emerald-deep)] active:shadow-[0_2px_0_var(--emerald-deep)]",
        ghost: "bg-lavender/10 text-night-foreground border-2 border-lavender/40 hover:bg-lavender/20",
        outline: "bg-card text-foreground border-2 border-primary/30 shadow-[0_4px_0_var(--border)]",
      },
      size: {
        sm: "h-10 px-4 text-sm",
        md: "h-12 px-6 text-base",
        lg: "h-14 px-8 text-lg",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface QuestButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof questButton> {}

export const QuestButton = React.forwardRef<HTMLButtonElement, QuestButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(questButton({ variant, size }), className)} {...props} />
  ),
);
QuestButton.displayName = "QuestButton";
