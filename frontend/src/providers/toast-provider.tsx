"use client";
import { createContext, useContext, useState } from "react";
const Context = createContext<{
  notify: (text: string, error?: boolean) => void;
  run: (action: () => Promise<unknown>, success?: string) => Promise<void>;
} | null>(null);
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<{ text: string; error: boolean } | null>(
    null,
  );
  function notify(text: string, error = false) {
    setToast({ text, error });
  }
  async function run(action: () => Promise<unknown>, success?: string) {
    try {
      await action();
      if (success) notify(success);
    } catch (error) {
      notify(
        error instanceof TypeError
          ? "We couldn’t connect. Please try again."
          : error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
        true,
      );
    }
  }
  return (
    <Context.Provider value={{ notify, run }}>
      {children}
      {toast && (
        <div
          className={"toast " + (toast.error ? "error" : "success")}
          role={toast.error ? "alert" : "status"}
        >
          <span className="toast-indicator" aria-hidden="true">
            {toast.error ? "!" : "✓"}
          </span>
          <div className="toast-content">
            <strong>{toast.error ? "Please check this" : "Update"}</strong>
            <p>{toast.text}</p>
          </div>
          <button className="secondary" onClick={() => setToast(null)}>
            Dismiss
          </button>
        </div>
      )}
    </Context.Provider>
  );
}
export function useToast() {
  const value = useContext(Context);
  if (!value) throw Error("ToastProvider is required");
  return value;
}
