import Link from "next/link";
import Logo from "../Logo";
import ThemeToggle from "../ThemeToggle";
import BrandPanel from "./BrandPanel";

type Props = {
  variant: "login" | "signup";
  children: React.ReactNode;
};

/** Split-screen frame shared by the login and sign-up pages: form on the left, brand panel on the right. */
export default function AuthShell({ variant, children }: Props) {
  const swap =
    variant === "login"
      ? { text: "New to RE Journal?", label: "Create an account", href: "/signup" }
      : { text: "Already have an account?", label: "Log in", href: "/login" };

  return (
    <main id="main" className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <section className="flex flex-col px-5 py-5 sm:px-10 lg:px-14">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" aria-label="RE Journal home" className="rounded-lg">
            <Logo />
          </Link>
          <div className="flex items-center gap-2">
          <p className="hidden text-[14px] text-muted sm:block">
            {swap.text}{" "}
            <Link href={swap.href} className="font-medium text-ink underline-offset-4 hover:underline">
              {swap.label}
            </Link>
          </p>
          <ThemeToggle />
          </div>
        </header>

        <div className="mx-auto flex w-full max-w-105 flex-1 flex-col justify-center py-12">{children}</div>

        <footer className="flex flex-wrap items-center justify-between gap-2 text-[12.5px] text-muted">
          <span>© 2026 RE Journal. All rights reserved.</span>
          <a href="mailto:support@rejournal.in" className="hover:text-ink">
            support@rejournal.in
          </a>
        </footer>
      </section>

      <aside className="relative hidden p-3 lg:block">
        <BrandPanel variant={variant} />
      </aside>
    </main>
  );
}
