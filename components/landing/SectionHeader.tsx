import type { ReactNode } from "react";

export default function SectionHeader({
  kicker,
  title,
  description,
}: {
  kicker?: string;
  title: ReactNode;
  description?: ReactNode;
}) {
  return (
    <header className="mb-8 sm:mb-10">
      {kicker ? (
        <div className="text-xs font-semibold tracking-widest text-zinc-500 uppercase">
          {kicker}
        </div>
      ) : null}
      <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight">
        {title}
      </h2>
      {description ? (
        <div className="mt-4 max-w-2xl text-zinc-700 leading-7">
          {description}
        </div>
      ) : null}
    </header>
  );
}

