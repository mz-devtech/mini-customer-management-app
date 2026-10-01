"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase, Customer } from "@/lib/supabase";

type Form = { name: string; phone: string; email: string; city: string };
type Toast = { id: number; type: "success" | "error" | "info"; text: string };
type ModalState =
  | { type: "form"; customer: Customer | null }
  | { type: "delete"; customer: Customer }
  | null;

const empty: Form = { name: "", phone: "", email: "", city: "" };

function validate(f: Form) {
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
const gradientFor = (s: string) =>
  gradients[[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % gradients.length];
const initials = (n: string) =>
  n.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");

export default function Home() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<ModalState>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const toastId = useRef(0);

  function toast(type: Toast["type"], text: string) {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, type, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) toast("error", error.message);
      else setCustomers(data || []);
      setLoading(false);
    })();
  }, []);

  // scroll to newly added / edited row (no page reload needed)
  useEffect(() => {
    if (!highlightId) return;
    const t1 = setTimeout(
      () =>
        document
          .getElementById(`row-${highlightId}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" }),
      100
    );
    const t2 = setTimeout(() => setHighlightId(null), 2500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [highlightId]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return customers;
    return customers.filter((c) =>
      [c.name, c.phone, c.email, c.city].some((v) => v.toLowerCase().includes(q))
    );
  }, [customers, search]);

  const cityCount = useMemo(
    () => new Set(customers.map((c) => c.city.toLowerCase())).size,
    [customers]
  );

  async function saveCustomer(form: Form, existing: Customer | null) {
    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      city: form.city.trim(),
    };
    if (existing) {
      const { data, error } = await supabase
        .from("customers")
        .update(payload)
        .eq("id", existing.id)
        .select()
        .single();
      if (error) return toast("error", error.message);
      setCustomers((prev) => prev.map((c) => (c.id === existing.id ? data : c)));
      setHighlightId(existing.id);
      toast("success", `${data.name} updated successfully`);
    } else {
      const { data, error } = await supabase
        .from("customers")
        .insert(payload)
        .select()
        .single();
      if (error) return toast("error", error.message);
      setCustomers((prev) => [...prev, data]); // appears at bottom instantly
      setHighlightId(data.id);
      toast("success", `${data.name} added successfully`);
    }
    setModal(null);
  }

  async function deleteCustomer(c: Customer) {
    const { error } = await supabase.from("customers").delete().eq("id", c.id);
    if (error) return toast("error", error.message);
    setModal(null);
    setRemovingId(c.id);
    setTimeout(() => {
      setCustomers((prev) => prev.filter((x) => x.id !== c.id));
      setRemovingId(null);
    }, 350);
    toast("info", `${c.name} deleted`);
  }

  return (
    <main className="wrap">
      <header className="hero">
        <div>
          <span className="pill">CRM · Dashboard</span>
          <h1>
            Customer <span className="grad">Hub</span>
          </h1>
          <p>Manage your customers in one clean place.</p>
        </div>
        <button className="btn primary big" onClick={() => setModal({ type: "form", customer: null })}>
          <span className="plus">+</span> Add Customer
        </button>
      </header>

      <section className="stats">
        <div className="stat">
          <small>Total Customers</small>
          <b>{customers.length}</b>
        </div>
        <div className="stat">
          <small>Cities</small>
          <b>{cityCount}</b>
        </div>
        <div className="stat">
          <small>Latest</small>
          <b className="trunc">{customers.length ? customers[customers.length - 1].name : "—"}</b>
        </div>
      </section>

      <section className="panel">
        <div className="toolbar">
          <h2>All Customers</h2>
          <div className="search">
            <span>🔍</span>
            <input
              placeholder="Search name, phone, email, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="state">
            <div className="spinner" />
            Loading customers...
          </div>
        ) : filtered.length === 0 ? (
          <div className="state">
            <div className="emoji">🗂️</div>
            {search ? "No customers match your search." : "No customers yet. Add your first one!"}
          </div>
        ) : (
          <div className="scroll">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>City</th>
                  <th className="right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    id={`row-${c.id}`}
                    className={`${highlightId === c.id ? "flash" : ""} ${
                      removingId === c.id ? "removing" : ""
                    }`}
                  >
                    <td>
                      <div className="who">
                        <span className="avatar" style={{ background: gradientFor(c.name) }}>
                          {initials(c.name)}
                        </span>
                        <b>{c.name}</b>
                      </div>
                    </td>
                    <td>{c.phone}</td>
                    <td>{c.email}</td>
                    <td>
                      <span className="tag">{c.city}</span>
                    </td>
                    <td className="right">
                      <button className="icon" title="Edit" onClick={() => setModal({ type: "form", customer: c })}>
                        ✏️
                      </button>
                      <button className="icon del" title="Delete" onClick={() => setModal({ type: "delete", customer: c })}>
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {modal?.type === "form" && (
        <FormModal
          customer={modal.customer}
          onClose={() => setModal(null)}
          onSave={saveCustomer}
        />
      )}
      {modal?.type === "delete" && (
        <DeleteModal
          customer={modal.customer}
          onClose={() => setModal(null)}
          onConfirm={deleteCustomer}
        />
      )}

      <div className="toasts">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>
            <span>{t.type === "success" ? "✅" : t.type === "error" ? "❌" : "🗑️"}</span>
            {t.text}
          </div>
        ))}
      </div>
    </main>
  );
}

function useEsc(onClose: () => void) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
}

function FormModal({
  customer,
  onClose,
  onSave,
}: {
  customer: Customer | null;
  onClose: () => void;
  onSave: (f: Form, c: Customer | null) => Promise<void>;
}) {
  const [form, setForm] = useState<Form>(
    customer
      ? { name: customer.name, phone: customer.phone, email: customer.email, city: customer.city }
      : empty
  );
  const [errors, setErrors] = useState<Partial<Form>>({});
  const [saving, setSaving] = useState(false);
  useEsc(onClose);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    await onSave(form, customer);
    setSaving(false);
  }

  const fields: { key: keyof Form; label: string; type: string; ph: string }[] = [
    { key: "name", label: "Customer Name", type: "text", ph: "e.g. Ali Khan" },
    { key: "phone", label: "Phone", type: "tel", ph: "e.g. 0300 1234567" },
    { key: "email", label: "Email", type: "email", ph: "e.g. ali@example.com" },
    { key: "city", label: "City", type: "text", ph: "e.g. Lahore" },
  ];

  return (
    <div className="overlay" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={submit} noValidate>
        <h3>{customer ? "Edit Customer" : "Add New Customer"}</h3>
        <p className="muted">
          {customer ? "Update the details below." : "Fill in the details to add a customer."}
        </p>
        {fields.map((f) => (
          <label key={f.key}>
            {f.label}
            <input
              autoFocus={f.key === "name"}
              type={f.type}
              placeholder={f.ph}
              value={form[f.key]}
              className={errors[f.key] ? "invalid" : ""}
              onChange={(e) => {
                setForm({ ...form, [f.key]: e.target.value });
                if (errors[f.key]) setErrors({ ...errors, [f.key]: undefined });
              }}
            />
            {errors[f.key] && <span className="error">{errors[f.key]}</span>}
          </label>
        ))}
        <div className="modal-actions">
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn primary" disabled={saving}>
            {saving ? "Saving..." : customer ? "Update" : "Add Customer"}
          </button>
        </div>
      </form>
    </div>
  );
}

function DeleteModal({
  customer,
  onClose,
  onConfirm,
}: {
  customer: Customer;
  onClose: () => void;
  onConfirm: (c: Customer) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  useEsc(onClose);
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal small" onClick={(e) => e.stopPropagation()}>
        <div className="warn">⚠️</div>
        <h3>Delete customer?</h3>
        <p className="muted">
          <b>{customer.name}</b> will be permanently removed. This cannot be undone.
        </p>
        <div className="modal-actions">
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn danger"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              await onConfirm(customer);
              setBusy(false);
            }}
          >
            {busy ? "Deleting..." : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}