"use client";

import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const INPUT =
  "h-12 w-full rounded-xl border border-line bg-white px-4 text-[15px] text-ink outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-muted/70 focus:border-accent/50 focus:shadow-[0_0_0_4px_var(--accent-soft)] aria-invalid:border-red-400 aria-invalid:focus:shadow-[0_0_0_4px_rgb(254_226_226)]";

type FieldProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "id"> & {
  label: string;
  error?: string;
  hint?: React.ReactNode;
  /** element rendered at the right of the label row (e.g. "Forgot password?") */
  aside?: React.ReactNode;
};

export function Field({ label, error, hint, aside, type = "text", ...input }: FieldProps) {
  const id = useId();
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const describedBy = [error && `${id}-err`, hint && `${id}-hint`].filter(Boolean).join(" ") || undefined;

  return (
    <div data-field>
      <div className="mb-1.5 flex items-center justify-between">
        <label htmlFor={id} className="text-[13.5px] font-medium text-ink-2">
          {label}
        </label>
        {aside}
      </div>
      <div className="relative">
        <input
          id={id}
          type={isPassword && show ? "text" : type}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`${INPUT} ${isPassword ? "pr-12" : ""}`}
          {...input}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-black/5 hover:text-ink"
          >
            {show ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
          </button>
        )}
      </div>
      {hint && !error && (
        <div id={`${id}-hint`} className="mt-1.5 text-[12.5px] text-muted">
          {hint}
        </div>
      )}
      {error && (
        <p id={`${id}-err`} className="mt-1.5 text-[12.5px] font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

export function SubmitButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="submit"
      className="group relative flex h-12 w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl bg-ink text-[15px] font-medium text-white transition-colors hover:bg-black/85"
    >
      <span className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/15 transition-transform duration-700 group-hover:translate-x-[420%]" />
      {children}
    </button>
  );
}

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
