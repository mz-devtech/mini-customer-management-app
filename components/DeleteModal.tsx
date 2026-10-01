"use client";
import { useState } from "react";
import { AlertTriangle, Trash2, Loader2 } from "lucide-react";
import { Customer } from "@/lib/supabase";
import Modal from "./Modal";

type Props = {
  customer: Customer;
  onClose: () => void;
  onConfirm: (c: Customer) => Promise<void>;
};

export default function DeleteModal({ customer, onClose, onConfirm }: Props) {
  const [busy, setBusy] = useState(false);
  return (
    <Modal onClose={onClose} small>
      <div className="warn"><AlertTriangle size={30} /></div>
      <h3>Delete customer?</h3>
      <p className="muted">
        <b>{customer.name}</b> will be permanently removed. This cannot be undone.
      </p>
      <div className="modal-actions">
        <button className="btn" onClick={onClose}>Cancel</button>
        <button
          className="btn danger"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            await onConfirm(customer);
            setBusy(false);
          }}
        >
          {busy ? <Loader2 size={16} className="spin" /> : <Trash2 size={16} />}
          {busy ? "Deleting..." : "Yes, Delete"}
        </button>
      </div>
    </Modal>
  );
}