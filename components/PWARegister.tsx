"use client";

import { useEffect } from "react";

/** Registers the service worker in production for offline / installable PWA. */
export function PWARegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }
    const register = () =>
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* ignore registration failures */
      });
    window.addEventListener("load", register);
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
