"use client";

import { useRef } from "react";
import { Info } from "lucide-react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { LIVE_SITE_URL } from "@/lib/site";

/**
 * Shown after a valid submit. This redesign has no account backend, so instead of pretending to
 * sign the user in, it says so and points to the live platform and to a demo.
 */
export default function PreviewNotice({ action, livePath }: { action: string; livePath: "/signin" | "/signup" }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    if (!prefersReducedMotion()) gsap.from(ref.current, { y: 12, autoAlpha: 0, duration: 0.6, ease: "expo.out" });
  });

  return (
    <div ref={ref} role="status" className="rounded-2xl border border-accent/20 bg-accent-soft/60 p-4 text-[14px] leading-relaxed text-ink-2">
      <div className="flex gap-3">
        <Info className="mt-0.5 h-4.5 w-4.5 shrink-0 text-accent" />
        <div>
          <p className="font-medium text-ink">{action} isn&apos;t connected in this preview.</p>
          <p className="mt-1">
            Use the{" "}
            <a href={`${LIVE_SITE_URL}${livePath}`} className="font-medium text-accent underline-offset-4 hover:underline">
              live RE Journal platform
            </a>{" "}
            for now, or{" "}
            <a href="mailto:subscription@rejournal.in?subject=Demo%20request" className="font-medium text-accent underline-offset-4 hover:underline">
              book a demo
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
