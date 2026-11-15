"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { Field, SubmitButton, isEmail } from "./fields";
import PreviewNotice from "./PreviewNotice";

type Errors = { email?: string; password?: string };

export default function LoginForm() {
  const root = useRef<HTMLDivElement>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from("[data-in]", { y: 18, autoAlpha: 0, duration: 0.9, ease: "expo.out", stagger: 0.06, delay: 0.1 });
    },
    { scope: root },
  );

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") ?? "");
    const password = String(data.get("password") ?? "");
    const next: Errors = {};
    if (!isEmail(email)) next.email = "Enter a valid email address.";
    if (!password) next.password = "Enter your password.";
    setErrors(next);
    setSent(Object.keys(next).length === 0);
    const form = e.currentTarget;
    if (Object.keys(next).length) requestAnimationFrame(() => form.querySelector<HTMLInputElement>("[aria-invalid]")?.focus());
  };

  return (
    <div ref={root}>
      <div data-in>
        <h1 className="text-[clamp(2rem,4vw,2.6rem)] font-semibold leading-[1.05] tracking-[-0.04em]">
          Welcome <span className="serif font-normal italic">back</span>
        </h1>
        <p className="mt-3 text-[15.5px] text-muted">Log in to your RE Journal dashboard.</p>
      </div>

      <form noValidate onSubmit={onSubmit} className="mt-9 flex flex-col gap-5">
        <div data-in>
          <Field label="Work email" name="email" type="email" autoComplete="email" placeholder="you@company.com" error={errors.email} />
        </div>
        <div data-in>
          <Field
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Your password"
            error={errors.password}
            aside={
              <a href="mailto:support@rejournal.in?subject=Password%20reset" className="text-[13px] font-medium text-accent hover:underline">
                Forgot password?
              </a>
            }
          />
        </div>
        <label data-in className="flex cursor-pointer items-center gap-2.5 text-[14px] text-ink-2 select-none">
          <input type="checkbox" name="remember" className="h-4 w-4 cursor-pointer rounded accent-(--accent)" />
          Keep me signed in
        </label>
        <div data-in className="mt-1">
          <SubmitButton>
            Log in <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </SubmitButton>
        </div>
        {sent && <PreviewNotice action="Signing in" livePath="/signin" />}
      </form>

      <p data-in className="mt-8 text-center text-[14px] text-muted">
        New to RE Journal?{" "}
        <Link href="/signup" className="font-medium text-ink underline-offset-4 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
