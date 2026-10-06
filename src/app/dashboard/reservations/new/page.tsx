"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Check, User, Clock } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { xof } from "@/lib/format";

type Court = { id: string; name: string; surface: string; image: string | null; pricePerSlot: number; description: string | null };
type Coach = { id: string; firstName: string; lastName: string; hourlyRate: number; specialization: string | null; photo: string | null };
type Booked = { courtId: string; startTime: string; endTime: string };

const SLOTS: string[] = [];
for (let h = 6; h < 24; h++) for (const m of ["00", "30"]) SLOTS.push(`${String(h).padStart(2, "0")}:${m}`);

const isoDay = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// Les dates dépendent du fuseau horaire du navigateur : la page n'est rendue que côté client
export default function NewReservationPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted)
    return (
      <div className="flex justify-center py-24 text-slate-400"><Loader2 className="animate-spin" /></div>
    );
  return <ReservationForm />;
}

function ReservationForm() {
  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  }, []);
  const days = useMemo(() => Array.from({ length: 14 }, (_, i) => { const d = new Date(tomorrow); d.setDate(d.getDate() + i); return d; }), [tomorrow]);

  const [date, setDate] = useState(isoDay(tomorrow));
  const [courts, setCourts] = useState<Court[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [booked, setBooked] = useState<Booked[]>([]);
  const [courtId, setCourtId] = useState("");
  const [start, setStart] = useState("");
  const [slots, setSlots] = useState(2);
  const [coachId, setCoachId] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Coach présélectionné depuis sa fiche (?coach=...)
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const c = q.get("coach");
    if (c) setCoachId(c);
    const court = q.get("court");
    if (court) setCourtId(court);
  }, []);

  useEffect(() => {
    setLoading(true);
    setStart("");
    fetch(`/api/reservations/availability?date=${date}`)
      .then((r) => r.json())
      .then((d) => {
        setCourts(d.courts);
        setCoaches(d.coaches);
        setBooked(d.booked);
        setCourtId((c) => c || d.courts[0]?.id || "");
      })
      .finally(() => setLoading(false));
  }, [date]);

  const court = courts.find((c) => c.id === courtId);
  const coach = coaches.find((c) => c.id === coachId);

  const slotTaken = (slot: string) => {
    const t0 = new Date(`${date}T${slot}:00`).getTime();
    return booked.some((b) => b.courtId === courtId && new Date(b.startTime).getTime() <= t0 && new Date(b.endTime).getTime() > t0);
  };
  const rangeFree = (slot: string, n: number) => {
    const i = SLOTS.indexOf(slot);
    if (i < 0 || i + n > SLOTS.length) return false;
    return SLOTS.slice(i, i + n).every((s) => !slotTaken(s));
  };
  const selected = (slot: string) => {
    if (!start) return false;
    const i = SLOTS.indexOf(start), j = SLOTS.indexOf(slot);
    return j >= i && j < i + slots;
  };
  const endLabel = start ? (SLOTS[SLOTS.indexOf(start) + slots] ?? "00:00") : "";

  const courtPrice = court ? court.pricePerSlot * slots : 0;
  const coachPrice = coach ? (coach.hourlyRate * slots) / 2 : 0;
  const total = courtPrice + coachPrice;

  async function submit() {
    setError("");
    setSubmitting(true);
    const res = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courtId, date, start, slots, coachId: coachId || null }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.message);
      setSubmitting(false);
      return;
    }
    window.location.href = data.paymentUrl;
  }

  return (
    <div>
      <PageHeader title="Réserver un court" subtitle="Choisissez votre jour, votre court et votre créneau. Paiement par MTN Money ou carte." />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Jour */}
          <section className="card p-5">
            <h2 className="mb-3 font-bold text-primary-400">1. Le jour</h2>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {days.map((d) => {
                const v = isoDay(d);
                return (
                  <button key={v} onClick={() => setDate(v)}
                    className={`min-w-[64px] rounded-xl border px-3 py-2 text-center transition ${date === v ? "border-primary-400 bg-primary-400 text-white" : "border-slate-200 bg-white hover:border-accent-500"}`}>
                    <span className="block text-xs uppercase opacity-70">{d.toLocaleDateString("fr-FR", { weekday: "short" })}</span>
                    <span className="block text-lg font-bold">{d.getDate()}</span>
                    <span className="block text-xs opacity-70">{d.toLocaleDateString("fr-FR", { month: "short" })}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Court */}
          <section className="card p-5">
            <h2 className="mb-3 font-bold text-primary-400">2. Le court</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {courts.map((c) => (
                <button key={c.id} onClick={() => { setCourtId(c.id); setStart(""); }}
                  className={`overflow-hidden rounded-xl border-2 text-left transition ${courtId === c.id ? "border-accent-500 ring-4 ring-accent-100" : "border-transparent hover:border-slate-200"}`}>
                  <img src={c.image ?? ""} alt="" className="aspect-[12/7] w-full object-cover" />
                  <div className="bg-slate-50 p-3">
                    <p className="flex items-center justify-between font-semibold text-primary-400">{c.name}{courtId === c.id && <Check size={16} />}</p>
                    <p className="text-xs text-slate-500">{c.surface} · {xof(c.pricePerSlot * 2)}/h</p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Créneau */}
          <section className="card p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-bold text-primary-400">3. Le créneau</h2>
              <div className="flex items-center gap-2 text-sm">
                <Clock size={16} className="text-slate-400" />
                <span className="text-slate-500">Durée</span>
                {[2, 3, 4].map((n) => (
                  <button key={n} onClick={() => { setSlots(n); if (start && !rangeFree(start, n)) setStart(""); }}
                    className={`rounded-lg px-3 py-1.5 font-semibold ${slots === n ? "bg-primary-400 text-white" : "bg-slate-100 text-slate-600"}`}>
                    {n === 2 ? "1 h" : n === 3 ? "1 h 30" : "2 h"}
                  </button>
                ))}
              </div>
            </div>
            {loading ? (
              <div className="flex justify-center py-10 text-slate-400"><Loader2 className="animate-spin" /></div>
            ) : (
              <>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
                  {SLOTS.map((slot) => {
                    const taken = slotTaken(slot);
                    const canStart = rangeFree(slot, slots);
                    const sel = selected(slot);
                    return (
                      <button key={slot} disabled={taken || (!canStart && !sel)} onClick={() => setStart(slot)}
                        className={`rounded-lg py-2 text-sm font-semibold transition ${
                          sel ? "bg-accent-400 text-primary-400" : taken ? "cursor-not-allowed bg-slate-100 text-slate-300 line-through" : canStart ? "bg-white text-slate-700 ring-1 ring-slate-200 hover:ring-accent-500" : "bg-white text-slate-300 ring-1 ring-slate-100"}`}>
                        {slot}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-white ring-1 ring-slate-200" /> Libre</span>
                  <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-accent-400" /> Votre sélection</span>
                  <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-slate-100" /> Déjà réservé</span>
                </div>
              </>
            )}
          </section>

          {/* Coach */}
          <section className="card p-5">
            <h2 className="mb-3 font-bold text-primary-400">4. Un coach ? <span className="font-normal text-slate-400">(facultatif)</span></h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <button onClick={() => setCoachId("")}
                className={`flex flex-col items-center justify-center rounded-xl border-2 p-3 text-sm ${!coachId ? "border-accent-500 bg-accent-50" : "border-slate-100"}`}>
                <User className="mb-1 text-slate-400" /> Sans coach
              </button>
              {coaches.map((c) => (
                <button key={c.id} onClick={() => setCoachId(c.id)}
                  className={`rounded-xl border-2 p-3 text-center text-sm ${coachId === c.id ? "border-accent-500 bg-accent-50" : "border-slate-100 hover:border-slate-200"}`}>
                  <img src={c.photo ?? ""} alt="" className="mx-auto h-14 w-14 rounded-full object-cover" />
                  <p className="mt-2 font-semibold text-primary-400">{c.firstName}</p>
                  <p className="text-xs text-slate-500">+{xof(c.hourlyRate)}/h</p>
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Récapitulatif */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="card overflow-hidden">
            {court && <img src={court.image ?? ""} alt="" className="aspect-[12/7] w-full object-cover" />}
            <div className="space-y-3 p-5">
              <h2 className="text-lg font-bold text-primary-400">Récapitulatif</h2>
              <Row k="Date" v={new Date(`${date}T12:00:00`).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })} />
              <Row k="Court" v={court ? `${court.name} · ${court.surface}` : "—"} />
              <Row k="Horaire" v={start ? `${start} – ${endLabel}` : "Choisissez un créneau"} />
              <Row k="Coach" v={coach ? `${coach.firstName} ${coach.lastName}` : "Aucun"} />
              <div className="border-t border-slate-100 pt-3">
                <Row k={`Court (${slots / 2} h)`} v={xof(courtPrice)} />
                {coach && <Row k="Coach" v={xof(coachPrice)} />}
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-2xl font-bold text-primary-400">{xof(total)}</span>
                </div>
              </div>
              {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
              <button onClick={submit} disabled={!start || !court || submitting} className="btn-accent w-full py-3">
                {submitting && <Loader2 size={16} className="animate-spin" />} Continuer vers le paiement
              </button>
              <p className="text-center text-xs text-slate-400">Annulation gratuite jusqu'à 24 h avant.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-slate-500">{k}</span>
      <span className="text-right font-medium text-slate-800">{v}</span>
    </div>
  );
}
