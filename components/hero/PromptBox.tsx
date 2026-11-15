"use client";

import { useEffect, useState } from "react";
import { ArrowUp, ChevronDown, Paperclip } from "lucide-react";
import { scrollToId } from "@/lib/gsap";
import { PROMPTS } from "./data";

/** Typewriter placeholder. Lives in its own component so typing only re-renders this box, not the whole hero. */
function useTypewriter(lines: string[], enabled: boolean) {
  const [text, setText] = useState("");
  useEffect(() => {
    if (!enabled) return;
    let li = 0,
      ci = 0,
      dir = 1;
    let id: ReturnType<typeof setTimeout>;
    const step = () => {
      const line = lines[li];
      ci += dir;
      setText(line.slice(0, ci));
      let delay = dir > 0 ? 45 + Math.random() * 40 : 18;
      if (dir > 0 && ci >= line.length) {
        dir = -1;
        delay = 1900;
      } else if (dir < 0 && ci <= 0) {
        dir = 1;
        li = (li + 1) % lines.length;
        delay = 350;
      }
      id = setTimeout(step, delay);
    };
    id = setTimeout(step, 900);
    return () => clearTimeout(id);
  }, [enabled, lines]);
  return text;
}

export default function PromptBox() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [sent, setSent] = useState(false);
  const typed = useTypewriter(PROMPTS, !focused && !query);

  return (
    <form
      data-hero-prompt
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
      className="relative z-30 mx-auto mt-8 w-[min(580px,calc(100%-32px))] rounded-2xl border border-line bg-white p-3 shadow-float"
    >
      <label htmlFor="ask" className="sr-only">
        Ask the market
      </label>
      <div className="relative min-h-12 px-1.5 pt-1">
        <textarea
          id="ask"
          rows={2}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSent(false);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              setSent(true);
            }
          }}
          className="block w-full resize-none bg-transparent text-[15px] leading-snug text-ink outline-none"
        />
        {!query && (
          <div className="pointer-events-none absolute inset-0 px-1.5 pt-1 text-left text-[15px] leading-snug text-muted/80">
            {focused ? "Ask about any market, asset class or submarket…" : typed}
            {!focused && <span className="caret ml-px inline-block h-[1.05em] w-[1.5px] translate-y-0.75 bg-ink/60" />}
          </div>
        )}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <button type="button" className="flex cursor-pointer items-center gap-1.5 rounded-full px-2 py-1.5 text-[13px] font-medium text-ink-2 hover:bg-black/5">
          <Paperclip className="h-3.5 w-3.5" /> Upload portfolio
        </button>
        <button type="button" className="hidden cursor-pointer items-center gap-1 rounded-full border border-line px-2.5 py-1 text-[13px] text-ink-2 hover:bg-black/5 sm:flex">
          All cities <ChevronDown className="h-3.5 w-3.5" />
        </button>
        <button
          type="submit"
          aria-label="Ask"
          className="ml-auto flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-ink text-white transition hover:scale-105 active:scale-95"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      </div>
      {sent && (
        <div className="mt-2 flex items-center justify-between gap-3 rounded-xl bg-accent-soft px-3 py-2 text-left text-[13px] text-ink-2">
          <span>Live answers run on the RE Journal platform.</span>
          <button type="button" onClick={() => scrollToId("contact")} className="shrink-0 cursor-pointer font-medium text-accent">
            Book a demo →
          </button>
        </div>
      )}
    </form>
  );
}
