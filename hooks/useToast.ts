"use client";
import { useCallback, useRef, useState } from "react";

export type ToastItem = { id: number; type: "success" | "error" | "info"; text: string };

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const toast = useCallback((type: ToastItem["type"], text: string) => {
    const id = ++counter.current;
    setToasts((t) => [...t, { id, type, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  return { toasts, toast };
}