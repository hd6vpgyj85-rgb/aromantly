import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "../lib/supabase";
import type { Customer } from "../types";
import { normalizePhone, normalizeSearch } from "../utils/normalize";

interface CustomerRow {
  id: string;
  name: string;
  phone: string;
  token: string;
  purchases_count: number;
  notes: string | null;
  created_at: string;
}

function rowToCustomer(row: CustomerRow): Customer {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    token: row.token,
    purchasesCount: row.purchases_count,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
  };
}

interface CreateCustomerInput {
  name: string;
  phone: string;
  notes?: string;
}

interface CustomersContextValue {
  customers: Customer[];
  isLoading: boolean;
  refresh: () => Promise<void>;
  createCustomer: (input: CreateCustomerInput) => Promise<Customer>;
  updateCustomer: (id: string, updates: Partial<CreateCustomerInput>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  setPurchasesCount: (id: string, count: number) => Promise<void>;
  incrementPurchases: (id: string) => Promise<void>;
  decrementPurchases: (id: string) => Promise<void>;
  searchCustomers: (query: string) => Customer[];
}

const CustomersContext = createContext<CustomersContextValue | undefined>(undefined);

export function CustomersProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const { data } = await supabase.from("customers").select("*").order("created_at", { ascending: false });
    setCustomers(((data ?? []) as CustomerRow[]).map(rowToCustomer));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createCustomer = useCallback(async (input: CreateCustomerInput) => {
    const { data, error } = await supabase
      .from("customers")
      .insert({ name: input.name, phone: input.phone, notes: input.notes ?? null, purchases_count: 0 })
      .select()
      .single();

    if (error) throw error;

    const created = rowToCustomer(data as CustomerRow);
    setCustomers((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateCustomer = useCallback(async (id: string, updates: Partial<CreateCustomerInput>) => {
    const payload: Record<string, unknown> = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.phone !== undefined) payload.phone = updates.phone;
    if (updates.notes !== undefined) payload.notes = updates.notes;

    const { error } = await supabase.from("customers").update(payload).eq("id", id);
    if (error) throw error;
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  }, []);

  const deleteCustomer = useCallback(async (id: string) => {
    const { error, count } = await supabase.from("customers").delete({ count: "exact" }).eq("id", id);
    if (error) throw error;
    if (!count) throw new Error("No se pudo eliminar el cliente (bloqueado por RLS).");
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const setPurchasesCount = useCallback(async (id: string, count: number) => {
    const safeCount = Math.max(0, count);
    const { error } = await supabase.from("customers").update({ purchases_count: safeCount }).eq("id", id);
    if (error) throw error;
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, purchasesCount: safeCount } : c)));
  }, []);

  const incrementPurchases = useCallback(
    async (id: string) => {
      const current = customers.find((c) => c.id === id);
      await setPurchasesCount(id, (current?.purchasesCount ?? 0) + 1);
    },
    [customers, setPurchasesCount]
  );

  const decrementPurchases = useCallback(
    async (id: string) => {
      const current = customers.find((c) => c.id === id);
      await setPurchasesCount(id, Math.max(0, (current?.purchasesCount ?? 0) - 1));
    },
    [customers, setPurchasesCount]
  );

  const searchCustomers = useCallback(
    (query: string) => {
      const normalizedQuery = normalizeSearch(query);
      const phoneQuery = normalizePhone(query);
      if (!normalizedQuery) return customers;

      return customers.filter((c) => {
        const matchesName = normalizeSearch(c.name).includes(normalizedQuery);
        const matchesPhone = phoneQuery.length > 0 && normalizePhone(c.phone).includes(phoneQuery);
        return matchesName || matchesPhone;
      });
    },
    [customers]
  );

  return (
    <CustomersContext.Provider
      value={{
        customers,
        isLoading,
        refresh,
        createCustomer,
        updateCustomer,
        deleteCustomer,
        setPurchasesCount,
        incrementPurchases,
        decrementPurchases,
        searchCustomers,
      }}
    >
      {children}
    </CustomersContext.Provider>
  );
}

export function useCustomers() {
  const ctx = useContext(CustomersContext);
  if (!ctx) throw new Error("useCustomers debe usarse dentro de CustomersProvider");
  return ctx;
}
