"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, ArrowLeft, Store, ShoppingBag, ShieldCheck } from "lucide-react";
import { useCart } from "@/lib/cart";
import { xof } from "@/lib/format";
import { PageHeader } from "@/components/ui";
import { StepTitle, SummaryRow } from "../../_member/ui";

export default function CheckoutClient({ defaultPhone }: { defaultPhone: string }) {
  const cart = useCart();
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState(defaultPhone);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const delivery = cart.total >= 50000 ? 0 : 2000;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/shop/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: cart.items.map((i) => ({ productId: i.id, quantity: i.quantity })), shippingAddress: address, phone }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.message); setLoading(false); return; }
    cart.clear();
    window.location.href = data.paymentUrl;
  }

  if (cart.ready && cart.items.length === 0)
    return (
      <div className="card mx-auto max-w-lg p-10 text-center">
        <ShoppingBag size={44} className="mx-auto mb-3 text-ink/20" />
        <p className="text-muted">Votre panier est vide.</p>
        <Link href="/dashboard/shop" className="btn-primary mt-5">Retour à la boutique</Link>
      </div>
    );

  return (
    <div>
      <Link href="/dashboard/shop" className="mb-4 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-muted hover:text-brand"><ArrowLeft size={16} /> Continuer mes achats</Link>
      <PageHeader eyebrow="Boutique officielle" title="Finaliser la commande" subtitle="Livraison à Cotonou ou retrait gratuit au club. Paiement à l'étape suivante." />
      <form onSubmit={submit} className="grid items-start gap-6 lg:grid-cols-12">
        <section className="card space-y-5 p-6 md:p-8 lg:col-span-8">
          <StepTitle n={1} title="Livraison" hint="Où devons-nous livrer votre commande ?" />
          <div>
            <label className="label" htmlFor="co-address">Adresse complète</label>
            <textarea id="co-address" className="input" rows={3} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Quartier, rue, repère (ex. près de l'église Saint-Michel)" required />
          </div>
          <div>
            <label className="label" htmlFor="co-phone">Téléphone pour le livreur</label>
            <input id="co-phone" className="input" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </div>
          <div className="flex items-start gap-3 rounded-2xl bg-brand-light p-4 text-sm text-ink">
            <Store size={18} className="mt-0.5 shrink-0 text-brand" />
            <p>Vous pouvez aussi retirer votre commande gratuitement à l'accueil du club : indiquez « Retrait au club » comme adresse.</p>
          </div>
        </section>

        <aside className="lg:sticky lg:top-6 lg:col-span-4">
          <div className="relative overflow-hidden rounded-[2rem] bg-ink p-6 text-white shadow-xl shadow-ink/15 md:p-7">
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-lime/15 blur-3xl" aria-hidden />
            <p className="relative text-[11px] font-bold uppercase tracking-[0.25em] text-lime">Récapitulatif</p>
            <div className="relative mt-4 space-y-3">
              {cart.items.map((i) => (
                <div key={i.id} className="flex items-center gap-3">
                  <img src={i.image ?? ""} alt="" className="h-12 w-12 rounded-xl bg-white/10 object-cover" />
                  <div className="min-w-0 flex-1 text-sm"><p className="truncate font-semibold">{i.name}</p><p className="text-white/55">× {i.quantity}</p></div>
                  <p className="tabular text-sm font-semibold">{xof(i.price * i.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="relative mt-4 border-t border-white/10 pt-1">
              <SummaryRow label="Sous-total" value={xof(cart.total)} />
              <SummaryRow label="Livraison" value={delivery ? xof(delivery) : "Offerte"} />
            </div>
            <div className="relative mt-3 flex items-end justify-between gap-3">
              <span className="text-sm text-white/60">Total</span>
              <span className="tabular font-display text-3xl font-black text-lime">{xof(cart.total + delivery)}</span>
            </div>
            {error && <p role="alert" className="relative mt-5 rounded-2xl bg-red-500/90 px-4 py-3 text-sm font-semibold text-white">{error}</p>}
            <button className="btn-accent relative mt-6 w-full" disabled={loading}>{loading && <Loader2 size={16} className="animate-spin" />} Valider et payer {xof(cart.total + delivery)}</button>
            <p className="relative mt-4 flex items-center justify-center gap-2 text-xs text-white/55"><ShieldCheck size={14} className="text-lime" /> MTN Mobile Money ou carte à l'étape suivante</p>
          </div>
        </aside>
      </form>
    </div>
  );
}
