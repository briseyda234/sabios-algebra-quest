import { createFileRoute, Link } from "@tanstack/react-router";
import heroBg from "@/assets/hero-bg.jpg";
import { SabioX } from "@/components/game/SabioX";
import { MagicBackdrop } from "@/components/game/MagicBackdrop";
import { questButton } from "@/components/game/QuestButton";
import { Logo } from "@/components/game/Logo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AlgebraQuest — Resuelve, avanza y conquista" },
      { name: "description", content: "Aventura de fantasía medieval para aprender álgebra básica de secundaria con Sabio X." },
      { property: "og:title", content: "AlgebraQuest — Resuelve, avanza y conquista" },
      { property: "og:description", content: "Aprende álgebra básica con ejercicios interactivos y la guía del búho mago Sabio X." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-night text-night-foreground">
      <img src={heroBg} alt="" width={1920} height={1088} className="absolute inset-0 h-full w-full object-cover opacity-70" />
      <div className="absolute inset-0 bg-gradient-to-b from-night/70 via-night/30 to-night" />
      <MagicBackdrop />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-8">
        <Logo />
        <Link to="/auth" search={{ mode: "login" }} className={questButton({ variant: "ghost", size: "sm" })}>
          Iniciar sesión
        </Link>
      </header>

      <section className="relative z-10 mx-auto grid max-w-6xl items-center gap-8 px-4 pb-16 pt-6 sm:px-8 lg:grid-cols-2 lg:pt-12">
        <div className="text-center lg:text-left">
          <p className="mb-3 inline-block rounded-full bg-gold/20 px-4 py-1 text-sm font-extrabold text-gold">
            ✦ Isla de las Variables ✦
          </p>
          <h1 className="text-glow text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">AlgebraQuest</h1>
          <p className="mt-2 font-display text-xl text-gold sm:text-2xl">Resuelve, avanza y conquista</p>
          <p className="mx-auto mt-5 max-w-lg text-base text-lavender/90 sm:text-lg lg:mx-0">
            Acompaña al búho mago Sabio X por islas flotantes y castillos mágicos. Supera desafíos de
            álgebra, gana puntos y estrellas, y desbloquea cada nivel de tu aventura.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
            <Link to="/auth" search={{ mode: "signup" }} className={questButton({ variant: "gold", size: "lg" })}>
              Comenzar aventura
            </Link>
            <Link to="/auth" search={{ mode: "login" }} className={questButton({ variant: "ghost", size: "lg" })}>
              Iniciar sesión
            </Link>
          </div>
        </div>
        <div className="flex justify-center">
          <div className="animate-float">
            <SabioX mood="happy" size="lg" bubbleSide="top" message="¡Hola, aventurero! Soy Sabio X. ¿Listo para conquistar el álgebra?" />
          </div>
        </div>
      </section>
    </main>
  );
}
