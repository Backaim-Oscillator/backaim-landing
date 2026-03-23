import Section from "./Section";
import SectionHeader from "./SectionHeader";

const bullets = [
  "Energy waste from data centers",
  "Fragile food supply chains",
  "Exploding demand for compute",
];

export default function Problem() {
  return (
    <Section>
      <SectionHeader title="PROBLEM" />
      <ul className="space-y-3 text-zinc-700 text-base leading-7">
        {bullets.map((b) => (
          <li key={b} className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-zinc-900" />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </Section>
  );
}

