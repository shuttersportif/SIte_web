import LegalTabs from "./LegalTabs";
import Reveal from "./Reveal";

export default function LegalPage({ title, intro, sections }) {
  return (
    <div className="min-h-[calc(100dvh-56px)] bg-paper text-[#111111]">
      <LegalTabs />

      <div className="px-5 py-10 sm:px-10 md:px-14">
        <Reveal index={0}>
          <h1 className="m-0 text-[32px] font-medium tracking-[-0.03em]">{title}</h1>
          <span aria-hidden="true" className="mt-3 block h-0.5 w-10 bg-accent" />
          {intro && <p className="mt-5 max-w-[70ch] text-[13px] text-black/60">{intro}</p>}
        </Reveal>

        <div className="mt-10 flex max-w-[70ch] flex-col gap-8">
          {sections.map((section, i) => (
            <Reveal key={section.heading} as="section" index={i + 1}>
              <h2 className="m-0 text-[15px] font-medium">{section.heading}</h2>
              <div className="mt-2 flex flex-col gap-2 text-[14px] leading-relaxed text-black/80">
                {section.paragraphs.map((p, j) => (
                  <p key={j} className="m-0">
                    {p}
                  </p>
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
