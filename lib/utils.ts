import { Customer } from "./supabase";

export type Form = { name: string; phone: string; email: string; city: string };
export const emptyForm: Form = { name: "", phone: "", email: "", city: "" };

export function validate(f: Form) {
  const e: Partial<Form> = {};
  if (f.name.trim().length < 2) e.name = "Name must be at least 2 characters";
  if (!/^[0-9+\-\s]{7,15}$/.test(f.phone.trim())) e.phone = "Enter a valid phone number";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = "Enter a valid email address";
  if (f.city.trim().length < 2) e.city = "City is required";
  return e;
}

const gradients = [
  "linear-gradient(135deg,#6366f1,#8b5cf6)",
  "linear-gradient(135deg,#ec4899,#f43f5e)",
  "linear-gradient(135deg,#06b6d4,#3b82f6)",
  "linear-gradient(135deg,#10b981,#14b8a6)",
  "linear-gradient(135deg,#f59e0b,#ef4444)",
];
export const gradientFor = (s: string) =>
  gradients[[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % gradients.length];

export const initials = (n: string) =>
  n.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");

export const tokens = (q: string) => q.toLowerCase().split(/\s+/).filter(Boolean);

// every word typed must match name/phone/email/city (phone ignores spaces & dashes)
export function matchesSearch(c: Customer, q: string) {
  const t = tokens(q);
  if (!t.length) return true;
  const hay = `${c.name} ${c.phone} ${c.email} ${c.city}`.toLowerCase();
  const digits = c.phone.replace(/\D/g, "");
  return t.every((w) => hay.includes(w) || (/^\d+$/.test(w) && digits.includes(w)));
}