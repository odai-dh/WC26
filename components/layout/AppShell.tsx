"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { ProgressBar, type StageKey } from "@/components/ui/ProgressBar";
import { BracketSwitcher } from "@/components/layout/BracketSwitcher";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/groups", label: "Groups" },
  { href: "/bracket", label: "Bracket" },
  { href: "/champion", label: "Champion" },
];

export function AppShell({
  children,
  activeStage,
}: {
  children: React.ReactNode;
  activeStage?: StageKey;
}) {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);

  // Publish the real header height so sticky sub-bars (e.g. the mobile round
  // stepper) can sit flush beneath it instead of slipping under a hardcoded offset.
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const set = () =>
      document.documentElement.style.setProperty(
        "--app-header-h",
        `${el.offsetHeight}px`,
      );
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    window.addEventListener("resize", set);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", set);
    };
  }, []);

  const renderNav = () =>
    NAV.map((item) => {
      const active = pathname?.startsWith(item.href);
      return (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "rounded-md px-3 py-1.5 text-center font-mono text-xs uppercase tracking-widest transition-colors",
            active
              ? "bg-elevated text-text-primary"
              : "text-text-secondary hover:text-text-primary",
          )}
        >
          {item.label}
        </Link>
      );
    });

  return (
    <div className="relative min-h-screen">
      <header
        ref={headerRef}
        className="sticky top-0 z-30 border-b border-border bg-base/85 backdrop-blur-md"
      >
        <div className="mx-auto flex max-w-[1400px] flex-col gap-2 px-4 py-2.5 md:px-8">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/"
              className="group flex shrink-0 items-center gap-2 whitespace-nowrap font-display text-xl font-black uppercase tracking-tight"
            >
              <span className="gradient-text">WC26</span>
              <span className="text-text-secondary transition-colors group-hover:text-text-primary">
                Final Call
              </span>
            </Link>
            <div className="flex min-w-0 items-center gap-2">
              <BracketSwitcher />
              {/* Inline nav on larger screens; full-width row below on mobile. */}
              <nav className="hidden items-center gap-1 sm:flex">
                {renderNav()}
              </nav>
            </div>
          </div>

          <nav className="grid grid-cols-3 gap-1 sm:hidden">{renderNav()}</nav>

          {activeStage && (
            <div className="border-t border-border/60 pt-1.5">
              <ProgressBar active={activeStage} />
            </div>
          )}
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-[1400px] px-4 py-8 md:px-8 md:py-10">
        {children}
      </main>
    </div>
  );
}
