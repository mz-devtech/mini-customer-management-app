"use client";
import { useEffect } from "react";

type Props = { onClose: () => void; small?: boolean; children: React.ReactNode };

export default function Modal({ onClose, small, children }: Props) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div className="overlay" onClick={onClose}>
      <div className={`modal ${small ? "small" : ""}`} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}