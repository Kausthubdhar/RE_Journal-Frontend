"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import Logo, { SocialIcon } from "./Logo";
import { gsap, prefersReducedMotion, scrollToId, useGSAP } from "@/lib/gsap";
import { LINKS } from "@/lib/site";

export const NAV_LINKS = [
  { label: "Home", id: "top" },
  { label: "About", id: "about" },
  { label: "Products", id: "solutions" },
  { label: "Insights", id: "insights" },
  { label: "Careers", id: "culture" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("top");
  const sheet = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLElement>(null);
  const links = useRef<Record<string, HTMLButtonElement | null>>({});
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null);

  useGSAP(() => {
    if (prefersReducedMotion()) return;
    gsap.from(bar.current, { y: -30, autoAlpha: 0, duration: 1, ease: "expo.out" });
  });

  // glass bar once scrolled + which section is under the reading line (40% down the screen)
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      setScrolled(window.scrollY > 30);
      const line = window.innerHeight * 0.4;
      let current = NAV_LINKS[0].id;
      for (const l of NAV_LINKS) {
        const el = document.getElementById(l.id);
        if (el && el.getBoundingClientRect().top <= line) current = l.id;
      }
      setActive(current);
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
    };
  }, []);

  // slide the highlight pill under the active link
  useEffect(() => {
    const el = links.current[active];
    if (el) setPill({ left: el.offsetLeft, width: el.offsetWidth });
  }, [active]);

  useEffect(() => {
    if (!sheet.current) return;
    if (open) {
      gsap.fromTo(sheet.current, { autoAlpha: 0, y: -12 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: "power3.out" });
      gsap.fromTo(sheet.current.querySelectorAll("[data-item]"), { y: 14, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.04, duration: 0.4, delay: 0.05 });
    } else gsap.to(sheet.current, { autoAlpha: 0, y: -8, duration: 0.2 });
  }, [open]);

  const go = (id: string) => {
    setOpen(false);
    scrollToId(id);
  };

  return (
    <header ref={bar} className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3">
      <nav
        className={`flex w-full items-center justify-between rounded-2xl px-4 py-2.5 transition-all duration-500 ease-out sm:px-5 ${
          scrolled ? "glass shadow-float max-w-270 border border-white/60" : "max-w-330 border border-transparent"
        }`}
      >
        <button onClick={() => go("top")} aria-label="RE Journal home" className="cursor-pointer">
          <Logo />
        </button>

        <ul className="relative hidden items-center gap-1 lg:flex">
          {pill && (
            <li
              aria-hidden
              className="pointer-events-none absolute inset-y-0 rounded-full bg-black/6 transition-[left,width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{ left: pill.left, width: pill.width }}
            />
          )}
          {NAV_LINKS.map((l) => (
            <li key={l.id}>
              <button
                ref={(el) => {
                  links.current[l.id] = el;
                }}
                onClick={() => go(l.id)}
                aria-current={active === l.id ? "true" : undefined}
                className={`relative cursor-pointer rounded-full px-3.5 py-1.5 text-[14px] transition-colors hover:text-ink ${
                  active === l.id ? "text-ink" : "text-ink-2"
                }`}
              >
                {l.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1.5">
          <a
            href="https://www.linkedin.com/company/rejournal-in"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            className="hidden h-9 w-9 items-center justify-center rounded-full text-ink-2 transition-colors hover:bg-black/5 sm:flex"
          >
            <SocialIcon name="linkedin" />
          </a>
          <Link href={LINKS.signIn} className="hidden rounded-full px-3.5 py-2 text-[14px] font-medium text-ink sm:block hover:bg-black/4.5">
            Log in
          </Link>
          <button
            onClick={() => go("contact")}
            className="hidden cursor-pointer rounded-full border border-line bg-white px-4 py-2 text-[14px] font-medium shadow-sm transition hover:border-black/20 md:block"
          >
            Book your demo
          </button>
          <Link
            href={LINKS.signUp}
            className="rounded-full bg-ink px-4 py-2 text-[14px] font-medium text-white transition hover:bg-black/80"
          >
            Get started
          </Link>
          <button
            className="ml-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full hover:bg-black/5 lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <div ref={sheet} className="invisible absolute inset-x-3 top-18 rounded-2xl glass shadow-float border border-white/60 p-3 opacity-0 lg:hidden">
        {NAV_LINKS.map((l) => (
          <button
            key={l.id}
            data-item
            onClick={() => go(l.id)}
            className="block w-full cursor-pointer rounded-xl px-4 py-3 text-left text-[17px] font-medium hover:bg-black/5"
          >
            {l.label}
          </button>
        ))}
        <div data-item className="mt-2 grid grid-cols-2 gap-2">
          <Link href={LINKS.signIn} className="rounded-xl border border-line bg-white px-4 py-3 text-center text-[15px] font-medium">
            Log in
          </Link>
          <button onClick={() => go("contact")} className="cursor-pointer rounded-xl border border-line bg-white px-4 py-3 text-[15px] font-medium">
            Book your demo
          </button>
        </div>
      </div>
    </header>
  );
}
