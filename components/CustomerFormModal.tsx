"use client";
import { useState } from "react";
import { X, User, Phone, Mail, MapPin, Loader2 } from "lucide-react";
import { Customer } from "@/lib/supabase";
import { Form, emptyForm, validate } from "@/lib/utils";
import Modal from "./Modal";

type Props = {
  customer: Customer | null;
  onClose: () => void;
  onSave: (f: Form, c: Customer | null) => Promise<void>;
};

const fields: { key: keyof Form; label: string; type: string; ph: string; icon: React.ReactNode }[] = [
  { key: "name", label: "Customer Name", type: "text", ph: "e.g. Ali Khan", icon: <User size={16} /> },
  { key: "phone", label: "Phone", type: "tel", ph: "e.g. 0300 1234567", icon: <Phone size={16} /> },
  { key: "email", label: "Email", type: "email", ph: "e.g. ali@example.com", icon: <Mail size={16} /> },
  { key: "city", label: "City", type: "text", ph: "e.g. Lahore", icon: <MapPin size={16} /> },
];

export default function CustomerFormModal({ customer, onClose, onSave }: Props) {
  const [form, setForm] = useState<Form>(
    customer
      ? { name: customer.name, phone: customer.phone, email: customer.email, city: customer.city }
      : emptyForm
  );
  const [errors, setErrors] = useState<Partial<Form>>({});
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    await onSave(form, customer);
    setSaving(false);
  }

  return (
    <Modal onClose={onClose}>
      <form onSubmit={submit} noValidate>
        <div className="modal-head">
          <div>
            <h3>{customer ? "Edit Customer" : "Add New Customer"}</h3>
            <p className="muted">
              {customer ? "Update the details below." : "Fill in the details to add a customer."}
            </p>
          </div>
          <button type="button" className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {fields.map((f) => (
          <label key={f.key}>
            {f.label}
            <div className={`field ${errors[f.key] ? "invalid" : ""}`}>
              {f.icon}
              <input
                autoFocus={f.key === "name"}
                type={f.type}
                placeholder={f.ph}
                value={form[f.key]}
                onChange={(e) => {
                  setForm({ ...form, [f.key]: e.target.value });
                  if (errors[f.key]) setErrors({ ...errors, [f.key]: undefined });
                }}
              />
            </div>
            {errors[f.key] && <span className="error">{errors[f.key]}</span>}
          </label>
        ))}

        <div className="modal-actions">
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn primary" disabled={saving}>
            {saving && <Loader2 size={16} className="spin" />}
            {saving ? "Saving..." : customer ? "Update" : "Add Customer"}
          </button>
        </div>
      </form>
    </Modal>
  );
}