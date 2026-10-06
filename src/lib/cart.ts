"use client";

import { useCallback, useEffect, useState } from "react";

export type CartItem = { id: string; name: string; price: number; image: string | null; quantity: number; stock: number };
const KEY = "btc_cart";

function read(): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

/** Panier conservé dans le navigateur (localStorage) */
export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(read());
    setReady(true);
  }, []);

  const save = useCallback((next: CartItem[]) => {
    setItems(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  }, []);

  const add = (p: Omit<CartItem, "quantity">) => {
    const cur = read();
    const ex = cur.find((i) => i.id === p.id);
    save(ex ? cur.map((i) => (i.id === p.id ? { ...i, quantity: Math.min(i.stock, i.quantity + 1) } : i)) : [...cur, { ...p, quantity: 1 }]);
  };
  const setQty = (id: string, q: number) => save(q <= 0 ? items.filter((i) => i.id !== id) : items.map((i) => (i.id === id ? { ...i, quantity: Math.min(i.stock, q) } : i)));
  const clear = () => save([]);
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return { items, ready, add, setQty, clear, total, count };
}
