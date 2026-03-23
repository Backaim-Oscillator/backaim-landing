import Section from "./Section";

export default function Disclaimer() {
  return (
    <Section className="py-10 sm:py-12">
      <div className="max-w-3xl rounded-2xl border border-zinc-200/70 bg-white/70 px-5 py-6 sm:px-7 sm:py-7">
        <p className="text-sm leading-6 text-zinc-700">
          Backaim P.S.A. does not offer securities or investment services.
          All partnerships are commercial in nature.
        </p>
      </div>
    </Section>
  );
}

