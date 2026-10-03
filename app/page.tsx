"use client";

import { useCallback, useEffect, useState } from "react";
import { Customer } from "@/lib/supabase";
import { Form } from "@/lib/utils";
import { createCustomer, updateCustomer, deleteCustomer, fetchMeta } from "@/lib/customers";
import { useCustomers } from "@/hooks/usecustomers";
import { useToast } from "@/hooks/useToast";
import Header from "@/components/Header";
import StatsCards from "@/components/StatsCards";
import SearchBar from "@/components/SearchBar";
import CustomerTable from "@/components/CustomerTable";
import CustomerFormModal from "@/components/CustomerFormModal";
import DeleteModal from "@/components/DeleteModal";
import ToastContainer from "@/components/ToastContainer";
import Pagination from "@/components/Pagination";
import ErrorState from "@/components/ErrorState";

const PAGE_SIZE = 10;

type ModalState =
  | { type: "form"; customer: Customer | null }
  | { type: "delete"; customer: Customer }
  | null;

export default function Home() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [modal, setModal] = useState<ModalState>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [meta, setMeta] = useState({ total: 0, cities: [] as string[], latest: "—" });
  const { toasts, toast } = useToast();
  const { customers, total, loading, error, refetch } = useCustomers(page, PAGE_SIZE, search, city);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const loadMeta = useCallback(async () => {
    const m = await fetchMeta();
    if (!m.error) setMeta(m);
  }, []);

  useEffect(() => {
    loadMeta();
  }, [loadMeta]);

  // if the last item of a page is deleted, go back one page
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  useEffect(() => {
    if (!highlightId) return;
    const t1 = setTimeout(
      () => document.getElementById(`row-${highlightId}`)?.scrollIntoView({ behavior: "smooth", block: "center" }),
      500
    );
    const t2 = setTimeout(() => setHighlightId(null), 2800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [highlightId]);

  async function saveCustomer(form: Form, existing: Customer | null) {
    if (existing) {
      const { data, error } = await updateCustomer(existing.id, form);
      if (error || !data) return toast("error", error || "Update failed");
      refetch();
      loadMeta();
      setHighlightId(existing.id);
      toast("success", `${data.name} updated successfully`);
    } else {
      const { data, error } = await createCustomer(form);
      if (error || !data) return toast("error", error || "Could not add customer");
      // newest customers are listed first, so go back to page 1 with no filters
      if (search || city || page !== 1) {
        setSearch("");
        setCity("");
        setPage(1);
      } else refetch();
      loadMeta();
      setHighlightId(data.id);
      toast("success", `${data.name} added successfully`);
    }
    setModal(null);
  }

  async function removeCustomer(c: Customer) {
    const { error } = await deleteCustomer(c.id);
    if (error) return toast("error", error);
    setModal(null);
    setRemovingId(c.id);
    setTimeout(() => {
      setRemovingId(null);
      refetch();
      loadMeta();
    }, 350);
    toast("info", `${c.name} deleted`);
  }

  return (
    <main className="wrap">
      <Header onAdd={() => setModal({ type: "form", customer: null })} />

      <StatsCards total={meta.total} cities={meta.cities.length} latest={meta.latest} />

      <section className="panel">
        <div className="toolbar">
          <h2>
            All Customers <span className="count">{total}</span>
          </h2>
          <div className="filters">
            <select
              className="filter"
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All cities</option>
              {meta.cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <SearchBar
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
            />
          </div>
        </div>

        {error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : (
          <CustomerTable
            customers={customers}
            loading={loading}
            query={search}
            highlightId={highlightId}
            removingId={removingId}
            onEdit={(c) => setModal({ type: "form", customer: c })}
            onDelete={(c) => setModal({ type: "delete", customer: c })}
          />
        )}

        {!error && total > 0 && (
          <Pagination page={page} totalPages={totalPages} total={total} pageSize={PAGE_SIZE} onPage={setPage} />
        )}
      </section>

      {modal?.type === "form" && (
        <CustomerFormModal customer={modal.customer} onClose={() => setModal(null)} onSave={saveCustomer} />
      )}
      {modal?.type === "delete" && (
        <DeleteModal customer={modal.customer} onClose={() => setModal(null)} onConfirm={removeCustomer} />
      )}

      <ToastContainer toasts={toasts} />
    </main>
  );
}