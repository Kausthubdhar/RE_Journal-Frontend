"use client";

import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { LINKS } from "@/lib/site";

function Magnetic({ children, className = "", href }: { children: React.ReactNode; className?: string; href: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const move = useRef<{ x: gsap.QuickToFunc; y: gsap.QuickToFunc } | null>(null);
  useGSAP(() => {
    move.current = {
      x: gsap.quickTo(ref.current, "x", { duration: 0.5, ease: "power3.out" }),
      y: gsap.quickTo(ref.current, "y", { duration: 0.5, ease: "power3.out" }),
    };
  });
  return (
    <a
      ref={ref}
      href={href}
      className={className}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        move.current?.x((e.clientX - r.left - r.width / 2) * 0.3);
        move.current?.y((e.clientY - r.top - r.height / 2) * 0.4);
      }}
      onPointerLeave={() => gsap.to(ref.current, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1,0.4)", overwrite: true })}
    >
      {children}
    </a>
  );
}

export default function CTA() {
  const root = useRef<HTMLElement>(null);
  const glow = useRef<HTMLDivElement>(null);
  const glowTo = useRef<{ x: gsap.QuickToFunc; y: gsap.QuickToFunc } | null>(null);

  useGSAP(
    () => {
      const panel = root.current!.querySelector<HTMLElement>("[data-cta-panel]")!;
      gsap.set(glow.current, { x: panel.offsetWidth / 2, y: panel.offsetHeight * 0.35 });
      glowTo.current = {
        x: gsap.quickTo(glow.current, "x", { duration: 1.2, ease: "power3.out" }),
        y: gsap.quickTo(glow.current, "y", { duration: 1.2, ease: "power3.out" }),
      };
      const split = SplitText.create("[data-cta-title]", { type: "chars,words", mask: "chars" });
      gsap.from(split.chars, {
        yPercent: 110,
        stagger: 0.012,
        duration: 1,
        ease: "expo.out",
        scrollTrigger: { trigger: "[data-cta-title]", start: "top 80%" },
      });
      gsap.from("[data-cta-panel]", {
        scale: 0.92,
        borderRadius: 80,
        ease: "none",
        scrollTrigger: { trigger: "[data-cta-panel]", start: "top bottom", end: "top 30%", scrub: true },
      });
      return () => split.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="contact" className="px-3 py-10 sm:px-5">
      <div
        data-cta-panel
        className="relative overflow-hidden rounded-[36px] bg-deep px-6 py-24 text-white sm:px-12 sm:py-32"
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          glowTo.current?.x(e.clientX - r.left);
          glowTo.current?.y(e.clientY - r.top);
        }}
      >
        <div className="bg-dots pointer-events-none absolute inset-0 opacity-60" />
        <div
          ref={glow}
          className="pointer-events-none absolute left-0 top-0 h-130 w-130 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(36,72,255,0.55), rgba(36,72,255,0) 65%)" }}
        />
        <div className="relative mx-auto max-w-245 text-center">
          <span className="eyebrow text-white/60!">Get access</span>
          <h2 data-cta-title className="mt-6 text-[clamp(2.4rem,6.4vw,5.4rem)] font-semibold leading-none tracking-[-0.045em]">
            Ready to transform your real estate decisions?
          </h2>
          <p className="mx-auto mt-6 max-w-130 text-[17px] leading-relaxed text-white/60">
            Get access to our premium analytics platform and make data-driven decisions.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Magnetic href={LINKS.signUp} className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 text-[15px] font-medium text-[#0e0f10]">
              Get started <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Magnetic>
            <Magnetic href="mailto:subscription@rejournal.in" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-4 text-[15px] font-medium text-white hover:bg-white/5">
              Book your demo
            </Magnetic>
          </div>
        </div>
      </div>
    </section>
  );
}
