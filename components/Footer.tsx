"use client";

import { useRef } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import Logo, { SocialIcon } from "./Logo";
import { NAV_LINKS } from "./Nav";
import { gsap, scrollToId, useGSAP } from "@/lib/gsap";

const SOCIAL = [
  { name: "linkedin" as const, href: "https://www.linkedin.com/company/rejournal-in", label: "LinkedIn" },
  { name: "x" as const, href: "https://x.com/REJournal_", label: "X" },
  { name: "youtube" as const, href: "https://www.youtube.com/@RE-Journal", label: "YouTube" },
];

export default function Footer() {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      gsap.from("[data-word] span", {
        yPercent: 100,
        stagger: 0.04,
        duration: 1.2,
        ease: "expo.out",
        scrollTrigger: { trigger: "[data-word]", start: "top 95%" },
      });
    },
    { scope: root },
  );

  return (
    <footer ref={root} className="relative overflow-hidden pt-20">
      <div className="mx-auto grid max-w-310 gap-12 px-5 sm:px-8 md:grid-cols-[1.4fr_1fr_1.4fr_1fr]">
        <div>
          <Logo />
          <p className="mt-5 max-w-[320px] text-[14px] leading-relaxed text-muted">
            High-quality real estate data, insights and forecasts, powered by a scientific econometric approach.
          </p>
          <p className="mt-5 max-w-[320px] text-[13px] leading-relaxed text-muted">
            Stay connected for the latest market insights, research reports and product updates.
          </p>
        </div>
        <div>
          <h4 className="text-[13px] font-medium uppercase tracking-[0.12em] text-muted">Quick links</h4>
          <ul className="mt-5 space-y-2.5">
            {NAV_LINKS.slice(1).map((l) => (
              <li key={l.id}>
                <button onClick={() => scrollToId(l.id)} className="cursor-pointer text-[15px] text-ink-2 hover:text-ink">
                  {l.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-[13px] font-medium uppercase tracking-[0.12em] text-muted">Contact us</h4>
          <ul className="mt-5 space-y-3.5 text-[14.5px] text-ink-2">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
              <a href="https://maps.google.com/?q=Parinee+Crescenzo+Bandra+Kurla+Complex+Mumbai" target="_blank" rel="noreferrer" className="hover:text-ink">
                1702, 17th Floor, Parinee Crescenzo, G-Block, Bandra Kurla Complex, Mumbai, Maharashtra 400051
              </a>
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
              <a href="tel:+918452832879" className="hover:text-ink">+91 84528 32879</a>
            </li>
            <li className="flex gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
              <span className="flex flex-col">
                <a href="mailto:support@rejournal.in" className="hover:text-ink">support@rejournal.in</a>
                <a href="mailto:subscription@rejournal.in" className="hover:text-ink">subscription@rejournal.in</a>
              </span>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-[13px] font-medium uppercase tracking-[0.12em] text-muted">Follow us</h4>
          <div className="mt-5 flex gap-2">
            {SOCIAL.map((s) => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                aria-label={s.label}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-ink-2 transition hover:-translate-y-0.5 hover:bg-ink hover:text-surface"
              >
                <SocialIcon name={s.name} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div data-word className="mx-auto mt-20 flex max-w-350 select-none justify-center overflow-hidden px-3 leading-[0.78]" aria-hidden>
        {"RE Journal".split("").map((ch, i) => (
          <span
            key={i}
            className={`inline-block text-[clamp(4.5rem,19vw,18rem)] tracking-[-0.06em] text-ink ${i > 2 ? "serif italic tracking-[-0.03em]" : "font-semibold"}`}
          >
            {ch === " " ? " " : ch}
          </span>
        ))}
      </div>

      <div className="mx-auto mt-6 flex max-w-310 flex-col items-center justify-between gap-2 border-t border-line px-5 py-6 text-[13px] text-muted sm:flex-row sm:px-8">
        <span>© 2026 RE Journal. All rights reserved.</span>
        <span>Built for data-driven real estate decisions.</span>
      </div>
    </footer>
  );
}
