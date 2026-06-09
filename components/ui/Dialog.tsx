"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/cn";

type ConfirmOptions = {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "default" | "danger";
};

type PromptOptions = {
  title: string;
  message?: string;
  defaultValue?: string;
  placeholder?: string;
  confirmLabel?: string;
};

type DialogState =
  | ({ kind: "confirm" } & ConfirmOptions)
  | ({ kind: "prompt" } & PromptOptions)
  | null;

type DialogApi = {
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
  prompt: (opts: PromptOptions) => Promise<string | null>;
};

const DialogContext = createContext<DialogApi | null>(null);

export function useDialog(): DialogApi {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("useDialog must be used within a DialogProvider");
  return ctx;
}

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DialogState>(null);
  const [value, setValue] = useState("");
  const resolveRef = useRef<((v: boolean | string | null) => void) | null>(null);

  const finish = useCallback((result: boolean | string | null) => {
    resolveRef.current?.(result);
    resolveRef.current = null;
    setState(null);
  }, []);

  const confirm = useCallback(
    (opts: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        resolveRef.current = (v) => resolve(Boolean(v));
        setState({ kind: "confirm", ...opts });
      }),
    [],
  );

  const prompt = useCallback(
    (opts: PromptOptions) =>
      new Promise<string | null>((resolve) => {
        resolveRef.current = (v) => resolve(v === false ? null : (v as string));
        setValue(opts.defaultValue ?? "");
        setState({ kind: "prompt", ...opts });
      }),
    [],
  );

  useEffect(() => {
    if (!state) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish(state.kind === "prompt" ? null : false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [state, finish]);

  const isPrompt = state?.kind === "prompt";
  const danger = state?.kind === "confirm" && state.tone === "danger";
  const cancel = () => finish(isPrompt ? null : false);
  const accept = () => finish(isPrompt ? value : true);

  return (
    <DialogContext.Provider value={{ confirm, prompt }}>
      {children}
      <AnimatePresence>
        {state && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={cancel}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-sm rounded-2xl border border-border bg-elevated p-6 shadow-2xl shadow-black/50"
            >
              <h2 className="font-display text-2xl font-black uppercase tracking-tight text-text-primary">
                {state.title}
              </h2>
              {state.message && (
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  {state.message}
                </p>
              )}

              {isPrompt && (
                <input
                  autoFocus
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") accept();
                  }}
                  placeholder={state.placeholder}
                  className="mt-4 w-full rounded-lg border border-border bg-surface px-3 py-2.5 font-display text-base font-bold uppercase tracking-wide text-text-primary outline-none transition focus:border-accent-gold/70"
                />
              )}

              <div className="mt-6 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={cancel}
                  className="rounded-lg border border-border bg-surface px-4 py-2 font-display text-sm font-bold uppercase tracking-wide text-text-secondary transition hover:border-white/30 hover:text-text-primary"
                >
                  {(state.kind === "confirm" && state.cancelLabel) || "Cancel"}
                </button>
                <button
                  type="button"
                  autoFocus={!isPrompt}
                  onClick={accept}
                  className={cn(
                    "rounded-lg px-4 py-2 font-display text-sm font-bold uppercase tracking-wide transition hover:brightness-110",
                    danger ? "bg-accent-red text-white" : "bg-accent-gold text-base",
                  )}
                >
                  {state.confirmLabel || (danger ? "Confirm" : "OK")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DialogContext.Provider>
  );
}
