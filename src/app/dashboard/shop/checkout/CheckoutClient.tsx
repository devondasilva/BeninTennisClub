"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, ArrowLeft } from "lucide-react";
import { useCart } from "@/lib/cart";
import { xof } from "@/lib/format";
import { PageHeader } from "@/components/ui";

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
        <p className="text-slate-500">Votre panier est vide.</p>
        <Link href="/dashboard/shop" className="btn-primary mt-4">Retour à la boutique</Link>
      </div>
    );

  return (
    <div>
      <Link href="/dashboard/shop" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-primary-400"><ArrowLeft size={16} /> Continuer mes achats</Link>
      <PageHeader title="Finaliser la commande" />
      <div className="grid gap-6 lg:grid-cols-3">
        <form onSubmit={submit} className="card space-y-4 p-6 lg:col-span-2">
          <h2 className="text-lg font-bold text-primary-400">Livraison</h2>
          <div><label className="label">Adresse complète</label>
            <textarea className="input" rows={3} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Quartier, rue, repère (ex. près de l'église Saint-Michel)" required /></div>
          <div><label className="label">Téléphone pour le livreur</label><input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} required /></div>
          <div className="rounded-xl bg-accent-50 p-4 text-sm text-primary-400">
            Vous pouvez aussi retirer votre commande gratuitement à l'accueil du club : indiquez « Retrait au club » comme adresse.
          </div>
          {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <button className="btn-accent w-full py-3" disabled={loading}>{loading && <Loader2 size={16} className="animate-spin" />} Valider et payer {xof(cart.total + delivery)}</button>
        </form>
        <aside className="card h-fit p-6">
          <h2 className="mb-4 text-lg font-bold text-primary-400">Récapitulatif</h2>
          <div className="space-y-3">
            {cart.items.map((i) => (
              <div key={i.id} className="flex items-center gap-3">
                <img src={i.image ?? ""} alt="" className="h-12 w-12 rounded-lg object-cover" />
                <div className="flex-1 text-sm"><p className="font-medium">{i.name}</p><p className="text-slate-500">× {i.quantity}</p></div>
                <p className="text-sm font-semibold">{xof(i.price * i.quantity)}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2 border-t pt-4 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Sous-total</span><span>{xof(cart.total)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Livraison</span><span>{delivery ? xof(delivery) : "Offerte"}</span></div>
            <div className="flex justify-between pt-2 text-lg font-bold text-primary-400"><span>Total</span><span>{xof(cart.total + delivery)}</span></div>
          </div>
        </aside>
      </div>
    </div>
  );
}
