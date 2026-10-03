import { supabase, Customer } from "./supabase";
import { Form } from "./utils";

type DbError = { code?: string; message: string };

// turn raw database errors into messages a user can understand
function friendly(e: DbError) {
  if (e.code === "23505") return "A customer with this email already exists";
  if (e.code === "42P01") return "Customers table not found. Run the SQL in supabase/schema.sql";
  return e.message;
}

const toPayload = (f: Form) => ({
  name: f.name.trim(),
  phone: f.phone.trim(),
  email: f.email.trim().toLowerCase(),
  city: f.city.trim(),
});

type ListParams = { page: number; pageSize: number; search: string; city: string };

// server-side pagination + search + city filter
export async function fetchCustomers({ page, pageSize, search, city }: ListParams) {
  const from = (page - 1) * pageSize;
  let q = supabase
    .from("customers")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + pageSize - 1);

  if (city) q = q.eq("city", city);
  const s = search.replace(/[%,()*]/g, " ").trim();
  if (s) q = q.or(`name.ilike.%${s}%,email.ilike.%${s}%,phone.ilike.%${s}%,city.ilike.%${s}%`);

  const { data, count, error } = await q;
  return { data: (data ?? []) as Customer[], count: count ?? 0, error: error ? friendly(error) : "" };
}

// small query used for the stats cards and the city filter
export async function fetchMeta() {
  const { data, error } = await supabase
    .from("customers")
    .select("name, city")
    .order("created_at", { ascending: false });
  if (error) return { total: 0, cities: [] as string[], latest: "—", error: friendly(error) };
  const rows = data ?? [];
  const cities = [...new Set(rows.map((r) => r.city))].sort();
  return { total: rows.length, cities, latest: rows[0]?.name ?? "—", error: "" };
}

export async function fetchCustomer(id: string) {
  const { data, error } = await supabase.from("customers").select("*").eq("id", id).maybeSingle();
  return { data: data as Customer | null, error: error ? friendly(error) : "" };
}

export async function createCustomer(f: Form) {
  const { data, error } = await supabase.from("customers").insert(toPayload(f)).select().single();
  return { data: data as Customer | null, error: error ? friendly(error) : "" };
}

export async function updateCustomer(id: string, f: Form) {
  const { data, error } = await supabase
    .from("customers").update(toPayload(f)).eq("id", id).select().single();
  return { data: data as Customer | null, error: error ? friendly(error) : "" };
}

export async function deleteCustomer(id: string) {
  const { error } = await supabase.from("customers").delete().eq("id", id);
  return { error: error ? friendly(error) : "" };
}