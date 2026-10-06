"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ShoppingCart, Star, Plus, Minus, X, Check, Eye, Truck, PackageCheck } from "lucide-react";
import { useCart } from "@/lib/cart";
import { xof } from "@/lib/format";
import type { Product } from "@/db/schema";

const CATS = [["ALL", "Tout"], ["RACKETS", "Raquettes"], ["BALLS", "Balles"], ["CLOTHING", "Vêtements"], ["SHOES", "Chaussures"], ["ACCESSORIES", "Accessoires"]];

export default function ShopClient({ products }: { products: Product[] }) {
  const cart = useCart();
  const [cat, setCat] = useState("ALL");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [added, setAdded] = useState<string | null>(null);
  const [view, setView] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const openProduct = (p: Product) => { setView(p); setQty(1); };
  const addToCart = (p: Product, n = 1) => {
    for (let i = 0; i < n; i++) cart.add({ id: p.id, name: p.name, price: p.price, image: p.image, stock: p.stock });
    setAdded(p.id);
    setTimeout(() => setAdded(null), 1200);
  };

  const list = products.filter((p) => (cat === "ALL" || p.category === cat) && p.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search size={16} className="absolute left-3 top-3 text-slate-400" />
          <input className="input pl-9" placeholder="Rechercher un article..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <button onClick={() => setOpen(true)} className="btn-primary relative">
          <ShoppingCart size={16} /> Panier
          {cart.count > 0 && <span className="absolute -right-2 -top-2 rounded-full bg-accent-400 px-2 py-0.5 text-xs font-bold text-primary-400">{cart.count}</span>}
        </button>
      </div>
      <div className="mb-6 flex flex-wrap gap-2">
        {CATS.map(([k, l]) => (
          <button key={k} onClick={() => setCat(k)} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${cat === k ? "bg-primary-400 text-white" : "bg-white text-slate-600 shadow-soft hover:bg-slate-50"}`}>{l}</button>
        ))}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {list.map((p) => (
          <div key={p.id} className="card group flex flex-col overflow-hidden">
            <button type="button" onClick={() => openProduct(p)} className="relative block overflow-hidden text-left" aria-label={`Voir le produit ${p.name}`}>
              <img src={p.image ?? ""} alt={p.name} className="aspect-square w-full object-cover transition duration-300 group-hover:scale-105" />
              <span className="absolute inset-x-3 bottom-3 flex items-center justify-center gap-1.5 rounded-xl bg-white/95 py-2 text-sm font-semibold text-primary-400 opacity-0 shadow-soft transition group-hover:opacity-100"><Eye size={15} /> Voir le produit</span>
              {p.stock <= 10 && <span className="chip absolute left-3 top-3 bg-red-100 text-red-700">Plus que {p.stock}</span>}
            </button>
            <div className="flex flex-1 flex-col p-4">
              <button type="button" onClick={() => openProduct(p)} className="text-left font-semibold text-primary-400 hover:underline">{p.name}</button>
              <p className="mt-1 line-clamp-2 text-xs text-slate-500">{p.description}</p>
              <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                <Star size={13} className="fill-amber-400 text-amber-400" /> {p.rating.toFixed(1)} <span>({p.reviews} avis)</span>
              </div>
              <div className="mt-auto flex items-center justify-between pt-4">
                <span className="text-lg font-bold text-primary-400">{xof(p.price)}</span>
                <button onClick={() => addToCart(p)}
                  disabled={p.stock === 0} className="btn-accent px-3 py-2">
                  {added === p.id ? <Check size={16} /> : <Plus size={16} />} {added === p.id ? "Ajouté" : "Ajouter"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {view && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={view.name}>
          <div className="absolute inset-0 bg-black/50" onClick={() => setView(null)} />
          <div className="relative grid max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl md:grid-cols-2">
            <button onClick={() => setView(null)} className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-2 shadow-soft hover:bg-slate-100" aria-label="Fermer"><X size={18} /></button>
            <img src={view.image ?? ""} alt={view.name} className="aspect-square w-full object-cover" />
            <div className="flex flex-col p-6">
              <h2 className="pr-8 text-2xl font-bold text-primary-400">{view.name}</h2>
              <div className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
                <Star size={15} className="fill-amber-400 text-amber-400" /> {view.rating.toFixed(1)} · {view.reviews} avis
              </div>
              <p className="mt-4 text-3xl font-extrabold text-primary-400">{xof(view.price)}</p>
              <p className="mt-4 text-slate-600">{view.description}</p>
              <ul className="mt-4 space-y-1.5 text-sm text-slate-600">
                <li className="flex items-center gap-2"><PackageCheck size={16} className="text-emerald-600" /> {view.stock > 10 ? "En stock" : view.stock > 0 ? `Plus que ${view.stock} en stock` : "Rupture de stock"}</li>
                <li className="flex items-center gap-2"><Truck size={16} className="text-slate-400" /> Livraison à Cotonou en 3 à 5 jours, ou retrait au club</li>
              </ul>
              <div className="mt-auto pt-6">
                <div className="mb-3 flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-600">Quantité</span>
                  <div className="flex items-center rounded-xl border border-slate-200">
                    <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-2.5 hover:bg-slate-50" aria-label="Moins"><Minus size={16} /></button>
                    <span className="w-8 text-center font-semibold">{qty}</span>
                    <button onClick={() => setQty(Math.min(view.stock, qty + 1))} className="p-2.5 hover:bg-slate-50" aria-label="Plus"><Plus size={16} /></button>
                  </div>
                </div>
                <button onClick={() => addToCart(view, qty)} disabled={view.stock === 0} className="btn-accent w-full py-3 text-base">
                  {added === view.id ? <><Check size={18} /> Ajouté au panier</> : <><ShoppingCart size={18} /> Ajouter au panier · {xof(view.price * qty)}</>}
                </button>
                {added === view.id && <button onClick={() => { setView(null); setOpen(true); }} className="btn-ghost mt-2 w-full">Voir le panier et commander</button>}
              </div>
            </div>
          </div>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b p-5">
              <h2 className="text-lg font-bold text-primary-400">Mon panier ({cart.count})</h2>
              <button onClick={() => setOpen(false)} aria-label="Fermer"><X /></button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              {cart.items.length === 0 && <p className="py-12 text-center text-slate-500">Votre panier est vide.</p>}
              {cart.items.map((i) => (
                <div key={i.id} className="flex gap-3">
                  <img src={i.image ?? ""} alt="" className="h-16 w-16 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{i.name}</p>
                    <p className="text-sm text-slate-500">{xof(i.price)}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <button onClick={() => cart.setQty(i.id, i.quantity - 1)} className="rounded-lg bg-slate-100 p-1"><Minus size={14} /></button>
                      <span className="w-6 text-center text-sm font-semibold">{i.quantity}</span>
                      <button onClick={() => cart.setQty(i.id, i.quantity + 1)} className="rounded-lg bg-slate-100 p-1"><Plus size={14} /></button>
                    </div>
                  </div>
                  <p className="text-sm font-bold">{xof(i.price * i.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="border-t p-5">
              <div className="mb-4 flex justify-between text-lg"><span>Sous-total</span><span className="font-bold text-primary-400">{xof(cart.total)}</span></div>
              <Link href="/dashboard/shop/checkout" className={`btn-accent w-full py-3 ${cart.count === 0 ? "pointer-events-none opacity-50" : ""}`}>Passer la commande</Link>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
