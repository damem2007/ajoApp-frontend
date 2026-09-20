"use client";
import { useEffect } from "react";
export default function PwaRegistration() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { type: "module" })
        .catch(() => {
          // The regular online application remains available if installation is blocked.
        });
    }
  }, []);
  return null;
}
