"use client";

import { useRef } from "react";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import SectionHeading from "./SectionHeading";
import { LINKS } from "@/lib/site";

const REPORTS = [
  {
    date: "Oct 30, 2026",
    tag: "Office Update",
    title: "India Office Update — Q3 2026",
    body: "Gross leasing of 20.6 Mn sq ft against new supply of 16.3 Mn sq ft. Hyderabad led leasing and completions, followed by Bengaluru, with GCCs as key demand drivers.",
    cover: { bg: "#2448ff", fg: "#ffffff", big: "Q3", sub: "2026" },
  },
  {
    date: "Aug 6, 2026",
    tag: "Warehousing Report",
    title: "India Warehousing Report — H1 2026",
    body: "Grade A warehousing across leading logistics hubs: leasing, new supply, stock, vacancy and cluster dynamics.",
    cover: { bg: "#e5ece8", fg: "#2f6a4d", big: "H1", sub: "2026" },
  },
  {
    date: "Jul 28, 2026",
    tag: "Office Report",
    title: "India Office Report — H1 2026",
    body: "GCCs took a 46% share of office leasing in H1 2026, while IT, manufacturing and BFSI drove growth.",
    cover: { bg: "#0e0f10", fg: "#ffffff", big: "46%", sub: "GCC share" },
  },
  {
    date: "Apr 27, 2026",
    tag: "Office Update",
    title: "India Office Update — Q1 2026",
    body: "Grade A office leasing crossed 15.1 Mn sq ft across five major Indian cities.",
    cover: { bg: "#f4ecdd", fg: "#9a6a22", big: "Q1", sub: "2026" },
  },
  {
    date: "Feb 12, 2026",
    tag: "Annual Report",
    title: "Annual Office Report — 2025",
    body: "Grade A office leasing, occupier trends and submarket performance across major Indian cities.",
    cover: { bg: "#ffe9de", fg: "#c2532c", big: "2025", sub: "Annual" },
  },
];

function Cover({ c, large = false }: { c: (typeof REPORTS)[number]["cover"]; large?: boolean }) {
  return (
    <div className="relative h-full w-full overflow-hidden" style={{ background: c.bg, color: c.fg }}>
      <svg viewBox="0 0 200 100" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-1/2 w-full opacity-30">
        <polyline points="0,80 25,70 50,74 75,52 100,58 125,38 150,42 175,20 200,26" fill="none" stroke="currentColor" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
        <polyline points="0,90 25,86 50,88 75,76 100,78 125,66 150,64 175,52 200,50" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="absolute left-5 top-4 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.14em] opacity-80">
        RE Journal Research
      </div>
      <div className={`absolute bottom-4 left-5 font-semibold leading-none tracking-tighter ${large ? "text-[clamp(4rem,9vw,7.5rem)]" : "text-[56px]"}`}>
        {c.big}
        <span className="serif ml-2 text-[0.32em] font-normal italic tracking-normal opacity-80">{c.sub}</span>
      </div>
    </div>
  );
}

export default function Reports() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.utils.toArray<HTMLElement>("[data-report]").forEach((el, i) => {
        gsap.from(el, {
          y: 70,
          opacity: 0,
          duration: 1.1,
          ease: "expo.out",
          delay: (i % 2) * 0.08,
          scrollTrigger: { trigger: el, start: "top 90%" },
        });
        const cover = el.querySelector("[data-cover]");
        if (cover)
          gsap.fromTo(
            cover,
            { clipPath: "inset(18% 18% 18% 18% round 18px)" },
            { clipPath: "inset(0% 0% 0% 0% round 18px)", ease: "expo.out", duration: 1.4, scrollTrigger: { trigger: el, start: "top 85%" } },
          );
      });
    },
    { scope: root },
  );

  // one reusable quickTo per cover instead of a new tween on every pointer move
  const tilt = (e: React.PointerEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const cover = el.querySelector<HTMLElement>("[data-cover]");
    if (!cover) return;
    const q = (cover as HTMLElement & { _tilt?: { x: gsap.QuickToFunc; y: gsap.QuickToFunc } })._tilt ??= {
      x: gsap.quickTo(cover, "rotateY", { duration: 0.6, ease: "power3.out" }),
      y: gsap.quickTo(cover, "rotateX", { duration: 0.6, ease: "power3.out" }),
    };
    const r = el.getBoundingClientRect();
    q.x(((e.clientX - r.left) / r.width - 0.5) * 8);
    q.y(-((e.clientY - r.top) / r.height - 0.5) * 8);
  };
  const untilt = (e: React.PointerEvent<HTMLElement>) =>
    gsap.to(e.currentTarget.querySelector("[data-cover]"), { rotateY: 0, rotateX: 0, duration: 0.8, ease: "elastic.out(1,0.5)", overwrite: true });

  const [first, ...rest] = REPORTS;

  return (
    <section ref={root} id="insights" className="relative py-28 sm:py-40">
      <div className="mx-auto max-w-310 px-5 sm:px-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <SectionHeading eyebrow="Insights" title="Latest research" accent="reports" />
          </div>
          <a href={LINKS.insights} className="group inline-flex w-fit items-center gap-2 rounded-full border border-line bg-white px-5 py-2.5 text-[14px] font-medium">
            All insights <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>

        <a
          href={LINKS.insights}
          data-report
          onPointerMove={tilt}
          onPointerLeave={untilt}
          className="group mt-14 grid gap-8 lg:grid-cols-[1.25fr_1fr] lg:items-center"
          style={{ perspective: 1000 }}
        >
          <div data-cover className="aspect-16/10 overflow-hidden rounded-[18px]">
            <Cover c={first.cover} large />
          </div>
          <div>
            <div className="flex items-center gap-3 text-[13px] text-muted">
              <span className="rounded-full bg-accent-soft px-2.5 py-1 font-medium text-accent">{first.tag}</span>
              {first.date}
            </div>
            <h3 className="mt-4 text-[clamp(1.8rem,3vw,2.6rem)] font-semibold leading-[1.08] tracking-[-0.03em]">{first.title}</h3>
            <p className="mt-4 max-w-120 text-[16px] leading-relaxed text-muted">{first.body}</p>
            <span className="mt-6 inline-flex items-center gap-2 text-[14px] font-medium">
              Read the report
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-white transition-transform duration-300 group-hover:rotate-45">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </span>
          </div>
        </a>

        <div className="mt-20 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {rest.map((r) => (
            <a key={r.title} href={LINKS.insights} data-report onPointerMove={tilt} onPointerLeave={untilt} className="group block" style={{ perspective: 800 }}>
              <div data-cover className="aspect-4/5 overflow-hidden rounded-[18px]">
                <Cover c={r.cover} />
              </div>
              <div className="mt-5 flex items-center gap-2 text-[12px] text-muted">
                <span className="font-medium text-ink-2">{r.tag}</span>·<span>{r.date}</span>
              </div>
              <h3 className="mt-2 text-[18px] font-semibold leading-snug tracking-[-0.015em] underline-offset-4 group-hover:underline">{r.title}</h3>
              <p className="mt-2 line-clamp-3 text-[14px] leading-relaxed text-muted">{r.body}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
