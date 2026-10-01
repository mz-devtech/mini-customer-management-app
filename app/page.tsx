"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase, Customer } from "@/lib/supabase";
import { Form, matchesSearch } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";
import Header from "@/components/Header";
import StatsCards from "@/components/StatsCards";
import SearchBar from "@/components/SearchBar";
import CustomerTable from "@/components/CustomerTable";
import CustomerFormModal from "@/components/CustomerFormModal";
import DeleteModal from "@/components/DeleteModal";
import ToastContainer from "@/components/ToastContainer";

type ModalState =
  | { type: "form"; customer: Customer | null }
  | { type: "delete"; customer: Customer }
  | null;

export default function Home() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<ModalState>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const { toasts, toast } = useToast();

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
  }, [toast]);

  // scroll to the added/edited row, then remove the highlight
  useEffect(() => {
    if (!highlightId) return;
    const t1 = setTimeout(
      () => document.getElementById(`row-${highlightId}`)?.scrollIntoView({ behavior: "smooth", block: "center" }),
      100
    );
    const t2 = setTimeout(() => setHighlightId(null), 2500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [highlightId]);

  const filtered = useMemo(
    () => customers.filter((c) => matchesSearch(c, search)),
    [customers, search]
  );
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
        .from("customers").update(payload).eq("id", existing.id).select().single();
      if (error) return toast("error", error.message);
      setCustomers((prev) => prev.map((c) => (c.id === existing.id ? data : c)));
      setHighlightId(existing.id);
      toast("success", `${data.name} updated successfully`);
    } else {
      const { data, error } = await supabase
        .from("customers").insert(payload).select().single();
      if (error) return toast("error", error.message);
      setCustomers((prev) => [...prev, data]);
      setSearch(""); // make sure the new row is visible
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
      <Header onAdd={() => setModal({ type: "form", customer: null })} />

      <StatsCards
        total={customers.length}
        cities={cityCount}
        latest={customers.length ? customers[customers.length - 1].name : "—"}
      />

      <section className="panel">
        <div className="toolbar">
          <h2>
            All Customers{" "}
            <span className="count">
              {search ? `${filtered.length} of ${customers.length}` : customers.length}
            </span>
          </h2>
          <SearchBar value={search} onChange={setSearch} />
        </div>

        <CustomerTable
          customers={filtered}
          loading={loading}
          query={search}
          highlightId={highlightId}
          removingId={removingId}
          onEdit={(c) => setModal({ type: "form", customer: c })}
          onDelete={(c) => setModal({ type: "delete", customer: c })}
        />
      </section>

      {modal?.type === "form" && (
        <CustomerFormModal customer={modal.customer} onClose={() => setModal(null)} onSave={saveCustomer} />
      )}
      {modal?.type === "delete" && (
        <DeleteModal customer={modal.customer} onClose={() => setModal(null)} onConfirm={deleteCustomer} />
      )}

      <ToastContainer toasts={toasts} />
    </main>
  );
}