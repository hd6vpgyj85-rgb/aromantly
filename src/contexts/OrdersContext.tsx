import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "../lib/supabase";
import type { Order, OrderAddress, OrderCustomer, OrderItem, OrderStatus } from "../types";

interface OrderRow {
  id: string;
  created_at: string;
  status: string;
  customer: OrderCustomer;
  address: OrderAddress;
  payment_method: string;
  notes: string | null;
  items: OrderItem[];
  total: number;
  archived_at: string | null;
}

function rowToOrder(row: OrderRow): Order {
  return {
    id: row.id,
    createdAt: row.created_at,
    status: row.status as OrderStatus,
    customer: row.customer,
    address: row.address,
    paymentMethod: row.payment_method,
    notes: row.notes ?? undefined,
    items: row.items,
    total: row.total,
    archivedAt: row.archived_at,
  };
}

interface CreateOrderInput {
  customer: OrderCustomer;
  address: OrderAddress;
  paymentMethod: string;
  notes?: string;
  items: OrderItem[];
  total: number;
}

interface OrdersContextValue {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createOrder: (input: CreateOrderInput) => Promise<Order>;
  updateStatus: (id: string, status: OrderStatus) => Promise<void>;
  archiveOrder: (id: string) => Promise<void>;
  restoreOrder: (id: string) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  activeOrders: Order[];
  archivedOrders: Order[];
}

const OrdersContext = createContext<OrdersContextValue | undefined>(undefined);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setIsLoading(false);
      return;
    }

    setOrders(((data ?? []) as OrderRow[]).map(rowToOrder));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createOrder = useCallback(async (input: CreateOrderInput) => {
    const { data, error: insertError } = await supabase
      .from("orders")
      .insert({
        customer: input.customer,
        address: input.address,
        payment_method: input.paymentMethod,
        notes: input.notes ?? null,
        items: input.items,
        total: input.total,
        status: "pendiente",
      })
      .select()
      .single();

    if (insertError) throw insertError;

    const created = rowToOrder(data as OrderRow);
    setOrders((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateStatus = useCallback(async (id: string, status: OrderStatus) => {
    const { error: updateError } = await supabase.from("orders").update({ status }).eq("id", id);
    if (updateError) throw updateError;
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  }, []);

  const archiveOrder = useCallback(async (id: string) => {
    const archivedAt = new Date().toISOString();
    const { error: updateError } = await supabase
      .from("orders")
      .update({ archived_at: archivedAt })
      .eq("id", id);
    if (updateError) throw updateError;
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, archivedAt } : o)));
  }, []);

  const restoreOrder = useCallback(async (id: string) => {
    const { error: updateError } = await supabase
      .from("orders")
      .update({ archived_at: null })
      .eq("id", id);
    if (updateError) throw updateError;
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, archivedAt: null } : o)));
  }, []);

  const deleteOrder = useCallback(async (id: string) => {
    const { error: deleteError, count } = await supabase
      .from("orders")
      .delete({ count: "exact" })
      .eq("id", id);

    if (deleteError) throw deleteError;
    if (!count) throw new Error("No se pudo eliminar el pedido (bloqueado por RLS).");

    setOrders((prev) => prev.filter((o) => o.id !== id));
  }, []);

  const activeOrders = orders.filter((o) => !o.archivedAt);
  const archivedOrders = orders.filter((o) => !!o.archivedAt);

  return (
    <OrdersContext.Provider
      value={{
        orders,
        isLoading,
        error,
        refresh,
        createOrder,
        updateStatus,
        archiveOrder,
        restoreOrder,
        deleteOrder,
        activeOrders,
        archivedOrders,
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders debe usarse dentro de OrdersProvider");
  return ctx;
}
