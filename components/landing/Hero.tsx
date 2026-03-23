import Container from "./Container";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-50 via-white to-white dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-900" />
      <div className="absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent dark:via-zinc-800" />

      <Container className="py-16 sm:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold tracking-widest text-zinc-500 uppercase">
              Backaim
            </p>
            <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05]">
              Build the Infrastructure of the Next Economy
            </h1>
            <p className="mt-5 text-lg sm:text-xl leading-7 text-zinc-700">
              AI Compute • Energy • Agriculture — Modular Systems Across Europe
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <a
                href="#operator-application"
                className="inline-flex h-12 items-center justify-center rounded-full bg-zinc-900 px-7 text-white font-medium transition-colors hover:bg-zinc-800"
              >
                Apply as Operator
              </a>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-zinc-200/70 bg-white/80 shadow-sm">
            <Image
              src="/images/Backaim hero infrast.png"
              alt="Backaim modular infrastructure concept"
              width={1200}
              height={800}
              className="h-auto w-full object-cover"
              priority
            />
          </div>
        </div>
      </Container>
    </section>
  );
}

