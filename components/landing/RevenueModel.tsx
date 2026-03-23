import Section from "./Section";
import SectionHeader from "./SectionHeader";

const bullets = [
  "AI Compute Infrastructure",
  "Agricultural Production",
  "Operator Licensing",
];

export default function RevenueModel() {
  return (
    <Section>
      <SectionHeader title="REVENUE MODEL" />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {bullets.map((b) => (
          <li
            key={b}
            className="rounded-2xl border border-zinc-200/70 bg-white/70 p-5 shadow-sm"
          >
            <p className="text-base font-semibold text-zinc-900">{b}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}

