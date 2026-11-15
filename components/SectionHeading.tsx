type Props = {
  eyebrow: string;
  title: string;
  accent: string;
  dark?: boolean;
  bodyWidth?: string;
  children?: React.ReactNode;
};

/** Shared section intro: eyebrow, headline with a serif-italic accent, optional body copy. */
export default function SectionHeading({ eyebrow, title, accent, dark = false, bodyWidth = "max-w-115", children }: Props) {
  return (
    <>
      <span className={`eyebrow ${dark ? "text-white/60!" : ""}`}>{eyebrow}</span>
      <h2 className="mt-5 text-[clamp(2.2rem,4.6vw,3.8rem)] font-semibold leading-[1.02] tracking-[-0.035em]">
        {title} <span className={`serif font-normal italic ${dark ? "text-white/80" : ""}`}>{accent}</span>
      </h2>
      {children && (
        <p className={`mt-5 ${bodyWidth} text-[16px] leading-relaxed ${dark ? "text-white/60" : "text-muted"}`}>{children}</p>
      )}
    </>
  );
}
