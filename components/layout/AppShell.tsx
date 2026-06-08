"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

  return (
    <div className="relative min-h-screen">
      <header className="sticky top-0 z-30 border-b border-border bg-base/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-2 px-4 py-2.5 md:px-8">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/"
              className="group flex items-center gap-2 font-display text-xl font-black uppercase tracking-tight"
            >
              <span className="gradient-text">WC26</span>
              <span className="text-text-secondary group-hover:text-text-primary transition-colors">
                Final Call
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <BracketSwitcher />
              <nav className="flex items-center gap-1">
                {NAV.map((item) => {
                  const active = pathname?.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "rounded-md px-2.5 py-1.5 font-mono text-xs uppercase tracking-widest transition-colors sm:px-3",
                        active
                          ? "bg-elevated text-text-primary"
                          : "text-text-secondary hover:text-text-primary",
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
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
