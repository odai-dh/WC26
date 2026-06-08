"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Copy, Pencil, Plus, Trash2 } from "lucide-react";
import {
  type BracketSlot,
  createBracket,
  deleteBracket,
  duplicateBracket,
  getActiveSlotId,
  listSlots,
  renameBracket,
  setActiveSlot,
} from "@/lib/storage";
import { cn } from "@/lib/cn";
import { useDialog } from "@/components/ui/Dialog";

export function BracketSwitcher() {
  const { confirm, prompt } = useDialog();
  const [open, setOpen] = useState(false);
  const [slots, setSlots] = useState<BracketSlot[]>([]);
  const [activeId, setActiveId] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const refresh = () => {
    setSlots(listSlots());
    setActiveId(getActiveSlotId());
  };

  useEffect(() => {
    refresh();
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const active = slots.find((s) => s.id === activeId);

  const switchTo = (id: string) => {
    if (id === activeId) return setOpen(false);
    setActiveSlot(id);
    window.location.reload();
  };

  const onNew = async () => {
    const name = await prompt({
      title: "New bracket",
      defaultValue: `Bracket ${slots.length + 1}`,
      placeholder: "Bracket name",
      confirmLabel: "Create",
    });
    if (name === null) return;
    setActiveSlot(createBracket(name || undefined));
    window.location.reload();
  };

  const onDuplicate = async (id: string) => {
    const src = slots.find((s) => s.id === id);
    const name = await prompt({
      title: "Duplicate bracket",
      defaultValue: `${src?.name ?? "Bracket"} copy`,
      placeholder: "Copy name",
      confirmLabel: "Duplicate",
    });
    if (name === null) return;
    setActiveSlot(duplicateBracket(id, name || undefined));
    window.location.reload();
  };

  const onRename = async (id: string) => {
    const src = slots.find((s) => s.id === id);
    const name = await prompt({
      title: "Rename bracket",
      defaultValue: src?.name ?? "",
      placeholder: "Bracket name",
      confirmLabel: "Rename",
    });
    if (name === null || !name.trim()) return;
    renameBracket(id, name);
    refresh();
  };

  const onDelete = async (id: string) => {
    const src = slots.find((s) => s.id === id);
    const ok = await confirm({
      title: "Delete bracket?",
      message: `"${src?.name}" and all of its picks will be removed.`,
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!ok) return;
    const next = deleteBracket(id);
    if (id === activeId) {
      setActiveSlot(next);
      window.location.reload();
    } else {
      refresh();
    }
  };

  if (!hydrated) {
    return (
      <div className="h-8 w-28 animate-pulse rounded-md border border-border bg-surface/50" />
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex max-w-[44vw] items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-1.5 text-text-primary transition-colors hover:border-white/30 sm:max-w-none"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="hidden font-mono text-[10px] uppercase tracking-widest text-text-muted sm:inline">
          Bracket
        </span>
        <span className="max-w-[120px] truncate font-display text-sm font-bold uppercase tracking-wide">
          {active?.name ?? "—"}
        </span>
        <ChevronDown
          className={cn("h-4 w-4 text-text-secondary transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-xl border border-border bg-elevated p-1.5 shadow-xl shadow-black/40"
        >
          <p className="px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.25em] text-text-muted">
            Your brackets
          </p>
          <div className="max-h-72 overflow-y-auto">
            {slots.map((s) => (
              <div
                key={s.id}
                className={cn(
                  "group flex items-center gap-1 rounded-lg px-1.5 transition-colors hover:bg-surface",
                  s.id === activeId && "bg-surface",
                )}
              >
                <button
                  type="button"
                  onClick={() => switchTo(s.id)}
                  className="flex min-w-0 flex-1 items-center gap-2 py-2 pl-1 text-left"
                >
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                    {s.id === activeId && (
                      <Check className="h-4 w-4 text-accent-gold" strokeWidth={3} />
                    )}
                  </span>
                  <span className="truncate font-display text-sm font-bold uppercase tracking-wide">
                    {s.name}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => onRename(s.id)}
                  className="rounded p-1.5 text-text-muted opacity-0 transition hover:text-text-primary group-hover:opacity-100"
                  aria-label="Rename"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onDuplicate(s.id)}
                  className="rounded p-1.5 text-text-muted opacity-0 transition hover:text-text-primary group-hover:opacity-100"
                  aria-label="Duplicate"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(s.id)}
                  className="rounded p-1.5 text-text-muted opacity-0 transition hover:text-accent-red group-hover:opacity-100"
                  aria-label="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={onNew}
            className="mt-1 flex w-full items-center gap-2 rounded-lg border border-dashed border-border px-2.5 py-2 font-display text-sm font-bold uppercase tracking-wide text-text-secondary transition hover:border-accent-gold/60 hover:text-accent-gold"
          >
            <Plus className="h-4 w-4" />
            New bracket
          </button>
        </div>
      )}
    </div>
  );
}
