import { Customer } from "./supabase";

export type Form = { name: string; phone: string; email: string; city: string };
export const emptyForm: Form = { name: "", phone: "", email: "", city: "" };

export function validate(f: Form) {
  const e: Partial<Form> = {};
  const name = f.name.trim(), phone = f.phone.trim(), email = f.email.trim(), city = f.city.trim();
  const letters = /^[\p{L}][\p{L}\s.'-]*$/u;

  if (!name) e.name = "Name is required";
  else if (name.length < 2 || name.length > 50) e.name = "Name must be 2 to 50 characters";
  else if (!letters.test(name)) e.name = "Name can only contain letters, spaces, . ' and -";

  const digits = phone.replace(/\D/g, "");
  if (!phone) e.phone = "Phone is required";
  else if (!/^\+?[0-9\s-]+$/.test(phone)) e.phone = "Use digits, spaces, - and an optional leading +";
  else if (digits.length < 10 || digits.length > 15) e.phone = "Phone must have 10 to 15 digits";

  if (!email) e.email = "Email is required";
  else if (email.length > 100) e.email = "Email is too long (max 100)";
  else if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(email)) e.email = "Enter a valid email address";

  if (!city) e.city = "City is required";
  else if (city.length < 2 || city.length > 40) e.city = "City must be 2 to 40 characters";
  else if (!letters.test(city)) e.city = "City can only contain letters and spaces";
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