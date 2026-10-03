"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Loader2, UserX } from "lucide-react";
import { Customer } from "@/lib/supabase";
import { fetchCustomer } from "@/lib/customers";
import { gradientFor, initials } from "@/lib/utils";
import ErrorState from "@/components/ErrorState";

export default function CustomerDetails() {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const res = await fetchCustomer(id);
    if (res.error) setError(res.error);
    else setCustomer(res.data);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const rows = customer
    ? [
        { icon: <Phone size={18} />, label: "Phone", value: customer.phone, href: `tel:${customer.phone}` },
        { icon: <Mail size={18} />, label: "Email", value: customer.email, href: `mailto:${customer.email}` },
        { icon: <MapPin size={18} />, label: "City", value: customer.city },
        {
          icon: <Calendar size={18} />,
          label: "Added on",
          value: customer.created_at ? new Date(customer.created_at).toLocaleString() : "—",
        },
      ]
    : [];

  return (
    <main className="wrap narrow">
      <Link href="/" className="back">
        <ArrowLeft size={16} /> Back to customers
      </Link>

      <div className="panel">
        {loading ? (
          <div className="state">
            <Loader2 className="spin" size={30} />
            Loading customer...
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : !customer ? (
          <div className="state">
            <UserX size={42} />
            <p>Customer not found. It may have been deleted.</p>
          </div>
        ) : (
          <>
            <div className="detail-head">
              <span className="avatar big-av" style={{ background: gradientFor(customer.name) }}>
                {initials(customer.name)}
              </span>
              <div>
                <h1>{customer.name}</h1>
                <span className="tag">{customer.city}</span>
              </div>
            </div>
            <div className="detail-list">
              {rows.map((r) => (
                <div className="detail-row" key={r.label}>
                  <div className="stat-ic">{r.icon}</div>
                  <div className="stat-txt">
                    <small>{r.label}</small>
                    {r.href ? <a href={r.href}>{r.value}</a> : <b>{r.value}</b>}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}