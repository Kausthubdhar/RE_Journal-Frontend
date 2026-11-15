"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { Field, SubmitButton, isEmail } from "./fields";
import PreviewNotice from "./PreviewNotice";

/** Audiences named in the site's own "About" copy. */
const ROLES = ["Investor", "Developer", "Occupier", "HNI", "Home buyer", "Solution provider"];

type Errors = { name?: string; email?: string; company?: string; role?: string; password?: string; consent?: string };

/** 0–4: length 8+, mixed case, a digit, a symbol. */
function strength(pw: string) {
  if (!pw) return 0;
  let s = pw.length >= 8 ? 1 : 0;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return pw.length < 8 ? Math.min(s, 1) : s;
}
const LEVELS = ["Too short", "Weak", "Fair", "Good", "Strong"];
const LEVEL_COLOR = ["bg-red-400", "bg-red-400", "bg-amber-400", "bg-emerald-500", "bg-emerald-500"];

export default function SignupForm() {
  const root = useRef<HTMLDivElement>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [role, setRole] = useState("");
  const [pw, setPw] = useState("");
  const [sent, setSent] = useState(false);
  const score = strength(pw);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from("[data-in]", { y: 18, autoAlpha: 0, duration: 0.9, ease: "expo.out", stagger: 0.05, delay: 0.1 });
    },
    { scope: root },
  );

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const next: Errors = {};
    if (!String(data.get("name") ?? "").trim()) next.name = "Enter your full name.";
    if (!isEmail(String(data.get("email") ?? ""))) next.email = "Enter a valid work email.";
    if (!String(data.get("company") ?? "").trim()) next.company = "Enter your company or organisation.";
    if (!role) next.role = "Choose the option that describes you best.";
    if (strength(pw) < 2) next.password = "Use at least 8 characters, mixing letters with numbers or symbols.";
    if (!data.get("consent")) next.consent = "Please agree so we can set up your access.";
    setErrors(next);
    setSent(Object.keys(next).length === 0);
    if (Object.keys(next).length) requestAnimationFrame(() => form.querySelector<HTMLElement>("[aria-invalid]")?.focus());
  };

  return (
    <div ref={root}>
      <div data-in>
        <h1 className="text-[clamp(2rem,4vw,2.6rem)] font-semibold leading-[1.05] tracking-[-0.04em]">
          Create your <span className="serif font-normal italic">account</span>
        </h1>
        <p className="mt-3 text-[15.5px] text-muted">Real estate data and forecasts for every decision, in one place.</p>
      </div>

      <form noValidate onSubmit={onSubmit} className="mt-9 flex flex-col gap-5">
        <div data-in className="grid gap-5 sm:grid-cols-2">
          <Field label="Full name" name="name" autoComplete="name" placeholder="Your full name" error={errors.name} />
          <Field label="Company" name="company" autoComplete="organization" placeholder="Company name" error={errors.company} />
        </div>
        <div data-in>
          <Field label="Work email" name="email" type="email" autoComplete="email" placeholder="you@company.com" error={errors.email} />
        </div>

        <fieldset data-in>
          <legend className="mb-2 text-[13.5px] font-medium text-ink-2">I am a…</legend>
          <div role="radiogroup" tabIndex={-1} aria-invalid={errors.role ? true : undefined} aria-describedby={errors.role ? "role-err" : undefined} className="flex flex-wrap gap-2">
            {ROLES.map((r) => {
              const on = role === r;
              return (
                <label
                  key={r}
                  className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-[13.5px] font-medium transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent ${
                    on ? "border-ink bg-ink text-white" : "border-line bg-white text-ink-2 hover:border-black/25"
                  }`}
                >
                  <input type="radio" name="role" value={r} checked={on} onChange={() => setRole(r)} className="sr-only" />
                  {r}
                </label>
              );
            })}
          </div>
          {errors.role && (
            <p id="role-err" className="mt-1.5 text-[12.5px] font-medium text-red-600">
              {errors.role}
            </p>
          )}
        </fieldset>

        <div data-in>
          <Field
            label="Password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            error={errors.password}
            hint={
              <span className="flex items-center gap-3" aria-live="polite">
                <span className="flex flex-1 gap-1" aria-hidden>
                  {[1, 2, 3, 4].map((i) => (
                    <span key={i} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${pw && score >= i ? LEVEL_COLOR[score] : "bg-black/8"}`} />
                  ))}
                </span>
                <span className="w-16 text-right">{pw ? LEVELS[score] : "Strength"}</span>
              </span>
            }
          />
        </div>

        <div data-in>
          <label className="flex cursor-pointer items-start gap-2.5 text-[13.5px] leading-snug text-ink-2 select-none">
            <input
              type="checkbox"
              name="consent"
              aria-invalid={errors.consent ? true : undefined}
              aria-describedby={errors.consent ? "consent-err" : undefined}
              className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded accent-(--accent)"
            />
            I agree to be contacted by RE Journal about my account and its products.
          </label>
          {errors.consent && (
            <p id="consent-err" className="mt-1.5 text-[12.5px] font-medium text-red-600">
              {errors.consent}
            </p>
          )}
        </div>

        <div data-in className="mt-1">
          <SubmitButton>
            Create account <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </SubmitButton>
        </div>
        {sent && <PreviewNotice action="Account creation" livePath="/signup" />}
      </form>

      <p data-in className="mt-8 text-center text-[14px] text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-ink underline-offset-4 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
