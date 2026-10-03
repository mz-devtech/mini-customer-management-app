"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Customer } from "@/lib/supabase";
import { fetchCustomers } from "@/lib/customers";

export function useCustomers(page: number, pageSize: number, search: string, city: string) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [debounced, setDebounced] = useState(search);
  const reqId = useRef(0);

  // wait 300ms after typing stops before querying the database
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    const id = ++reqId.current;
    setLoading(true);
    setError("");
    const res = await fetchCustomers({ page, pageSize, search: debounced, city });
    if (id !== reqId.current) return; // ignore outdated responses
    if (res.error) setError(res.error);
    else {
      setCustomers(res.data);
      setTotal(res.count);
    }
    setLoading(false);
  }, [page, pageSize, debounced, city]);

  useEffect(() => {
    load();
  }, [load]);

  return { customers, total, loading, error, refetch: load };
}