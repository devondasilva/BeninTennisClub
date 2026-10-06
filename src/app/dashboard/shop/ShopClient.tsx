"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, ShoppingCart, Star, Plus, Minus, X, Check, Eye, Truck, PackageCheck, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart";
import { xof } from "@/lib/format";
import type { Product } from "@/db/types";
import { segItem, segWrap } from "../_member/ui";

const CATS = [["ALL", "Tout"], ["RACKETS", "Raquettes"], ["BALLS", "Balles"], ["CLOTHING", "Vêtements"], ["SHOES", "Chaussures"], ["ACCESSORIES", "Accessoires"]];
const CAT_LABEL: Record<string, string> = Object.fromEntries(CATS);

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

  // Échap ferme la fiche produit ou le panier
  useEffect(() => {
    if (!view && !open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setView(null); setOpen(false); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [view, open]);

  const list = products.filter((p) => (cat === "ALL" || p.category === cat) && p.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <div className="mb-8 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" />
            <input className="input pl-11" aria-label="Rechercher un article" placeholder="Rechercher un article..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <button type="button" onClick={() => setOpen(true)} className="btn-dark relative">
            <ShoppingCart size={16} /> Panier
            {cart.count > 0 && <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-lime px-1.5 text-xs font-bold text-ink ring-2 ring-mist">{cart.count}</span>}
          </button>
        </div>
        <div className={segWrap} role="group" aria-label="Catégories">
          {CATS.map(([k, l]) => (
            <button key={k} type="button" onClick={() => setCat(k)} aria-pressed={cat === k} className={segItem(cat === k)}>{l}</button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <div className="card p-12 text-center text-muted">Aucun article ne correspond à votre recherche.</div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((p) => (
            <article key={p.id} className="card group flex flex-col overflow-hidden transition-shadow duration-300 hover:shadow-xl hover:shadow-brand/10">
              <button type="button" onClick={() => openProduct(p)} className="relative block overflow-hidden bg-mist text-left" aria-label={`Voir le produit ${p.name}`}>
                <img src={p.image ?? ""} alt={p.name} className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-ink backdrop-blur">{CAT_LABEL[p.category] ?? p.category}</span>
                <span className={`absolute right-4 top-4 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest ${p.stock === 0 ? "bg-red-600 text-white" : p.stock <= 10 ? "bg-lime text-ink" : "bg-ink/75 text-white backdrop-blur"}`}>
                  {p.stock === 0 ? "Épuisé" : p.stock <= 10 ? `Plus que ${p.stock}` : "En stock"}
                </span>
                <span className="absolute inset-x-4 bottom-4 flex items-center justify-center gap-1.5 rounded-2xl bg-ink/85 py-2.5 text-xs font-bold uppercase tracking-widest text-white opacity-0 backdrop-blur transition group-hover:opacity-100"><Eye size={15} /> Voir le produit</span>
              </button>
              <div className="flex flex-1 flex-col p-5">
                <button type="button" onClick={() => openProduct(p)} className="text-left font-display text-lg font-black leading-snug tracking-tight text-ink hover:text-brand">{p.name}</button>
                <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">{p.description}</p>
                <div className="mt-2 flex items-center gap-1 text-xs text-muted">
                  <Star size={13} className="fill-amber-400 text-amber-400" /> <span className="font-semibold text-ink">{p.rating.toFixed(1)}</span> <span>({p.reviews} avis)</span>
                </div>
                <div className="mt-auto flex items-center justify-between gap-2 pt-5">
                  <span className="tabular font-display text-xl font-black text-brand">{xof(p.price)}</span>
                  <button type="button" onClick={() => addToCart(p)} disabled={p.stock === 0} className="btn-primary btn-sm">
                    {added === p.id ? <Check size={15} /> : <Plus size={15} />} {added === p.id ? "Ajouté" : "Ajouter"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {view && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={view.name}>
          <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={() => setView(null)} />
          <div className="relative grid max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] bg-white shadow-2xl md:grid-cols-2">
            <button type="button" onClick={() => setView(null)} className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 text-ink shadow-sm hover:bg-mist" aria-label="Fermer"><X size={18} /></button>
            <div className="bg-mist">
              <img src={view.image ?? ""} alt={view.name} className="aspect-square h-full w-full object-cover" />
            </div>
            <div className="flex flex-col p-6 md:p-8">
              <p className="eyebrow">{CAT_LABEL[view.category] ?? view.category}</p>
              <h2 className="mt-2 pr-8 font-display text-2xl font-black tracking-tight text-ink md:text-3xl">{view.name}</h2>
              <div className="mt-2 flex items-center gap-1.5 text-sm text-muted">
                <Star size={15} className="fill-amber-400 text-amber-400" /> {view.rating.toFixed(1)} · {view.reviews} avis
              </div>
              <p className="tabular mt-4 font-display text-3xl font-black text-brand">{xof(view.price)}</p>
              <p className="mt-4 leading-relaxed text-ink/75">{view.description}</p>
              <ul className="mt-4 space-y-1.5 text-sm text-ink/75">
                <li className="flex items-center gap-2"><PackageCheck size={16} className="text-emerald-700" /> {view.stock > 10 ? "En stock" : view.stock > 0 ? `Plus que ${view.stock} en stock` : "Rupture de stock"}</li>
                <li className="flex items-center gap-2"><Truck size={16} className="text-brand" /> Livraison à Cotonou en 3 à 5 jours, ou retrait au club</li>
              </ul>
              <div className="mt-auto pt-6">
                <div className="mb-4 flex items-center gap-3">
                  <span className="label !mb-0">Quantité</span>
                  <div className="flex items-center rounded-2xl border-2 border-ink/10">
                    <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} className="rounded-l-2xl p-2.5 text-ink hover:bg-mist" aria-label="Moins"><Minus size={16} /></button>
                    <span className="tabular w-9 text-center font-bold text-ink" aria-live="polite">{qty}</span>
                    <button type="button" onClick={() => setQty(Math.min(view.stock, qty + 1))} className="rounded-r-2xl p-2.5 text-ink hover:bg-mist" aria-label="Plus"><Plus size={16} /></button>
                  </div>
                </div>
                <button type="button" onClick={() => addToCart(view, qty)} disabled={view.stock === 0} className="btn-primary w-full">
                  {added === view.id ? <><Check size={18} /> Ajouté au panier</> : <><ShoppingCart size={18} /> Ajouter au panier · {xof(view.price * qty)}</>}
                </button>
                {added === view.id && <button type="button" onClick={() => { setView(null); setOpen(true); }} className="btn-ghost mt-2 w-full">Voir le panier et commander</button>}
              </div>
            </div>
          </div>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="cart-title">
          <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-ink/[0.06] p-6">
              <h2 id="cart-title" className="font-display text-2xl font-black tracking-tight text-ink">Mon panier ({cart.count})</h2>
              <button type="button" onClick={() => setOpen(false)} className="rounded-full p-2 text-ink hover:bg-mist" aria-label="Fermer"><X /></button>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-6">
              {cart.items.length === 0 && (
                <div className="py-14 text-center text-muted">
                  <ShoppingBag size={40} className="mx-auto mb-3 text-ink/20" />
                  Votre panier est vide.
                </div>
              )}
              {cart.items.map((i) => (
                <div key={i.id} className="flex gap-3 rounded-2xl border border-ink/[0.06] p-3">
                  <img src={i.image ?? ""} alt="" className="h-16 w-16 rounded-xl bg-mist object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-ink">{i.name}</p>
                    <p className="text-sm text-muted">{xof(i.price)}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <button type="button" onClick={() => cart.setQty(i.id, i.quantity - 1)} className="rounded-lg bg-mist p-1.5 text-ink hover:bg-cloud" aria-label={`Retirer un ${i.name}`}><Minus size={14} /></button>
                      <span className="tabular w-6 text-center text-sm font-bold">{i.quantity}</span>
                      <button type="button" onClick={() => cart.setQty(i.id, i.quantity + 1)} className="rounded-lg bg-mist p-1.5 text-ink hover:bg-cloud" aria-label={`Ajouter un ${i.name}`}><Plus size={14} /></button>
                    </div>
                  </div>
                  <p className="tabular text-sm font-bold text-ink">{xof(i.price * i.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="relative overflow-hidden bg-ink p-6 text-white">
              <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-lime/15 blur-3xl" aria-hidden />
              <div className="relative mb-4 flex items-end justify-between">
                <span className="text-sm text-white/60">Sous-total</span>
                <span className="tabular font-display text-2xl font-black text-lime">{xof(cart.total)}</span>
              </div>
              <Link href="/dashboard/shop/checkout" className={`btn-accent relative w-full ${cart.count === 0 ? "pointer-events-none opacity-50" : ""}`}>Passer la commande</Link>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
