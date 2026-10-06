"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, User, Clock, ShieldCheck, CalendarDays } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { optionCls } from "@/lib/ui";
import { xof } from "@/lib/format";
import { SelectedTick, StepTitle, SummaryRow, segItem, segWrap } from "../../_member/ui";

type Court = { id: string; name: string; surface: string; image: string | null; pricePerSlot: number; description: string | null };
type Coach = { id: string; firstName: string; lastName: string; hourlyRate: number; specialization: string | null; photo: string | null };
type Booked = { courtId: string; startTime: string; endTime: string };

const SLOTS: string[] = [];
for (let h = 6; h < 24; h++) for (const m of ["00", "30"]) SLOTS.push(`${String(h).padStart(2, "0")}:${m}`);

const isoDay = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const SUBTITLE = "Choisissez votre jour, votre court et votre créneau. Paiement par MTN Money ou carte.";

// Les dates dépendent du fuseau horaire du navigateur : la page n'est rendue que côté client
export default function NewReservationPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted)
    return (
      <div>
        <PageHeader title="Réserver un court" subtitle={SUBTITLE} />
        <div className="flex justify-center py-24 text-ink/40"><Loader2 className="animate-spin" /></div>
      </div>
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
      <PageHeader eyebrow="Réservation · Courts du club" title="Réserver un court" subtitle={SUBTITLE} />

      <div className="grid items-start gap-6 lg:grid-cols-12">
        <div className="min-w-0 space-y-6 lg:col-span-8">
          {/* 1. Jour */}
          <section className="card p-6 md:p-8">
            <StepTitle n={1} title="Le jour" hint="Réservable jusqu'à deux semaines à l'avance." />
            <div className="scroll-thin -mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
              {days.map((d) => {
                const v = isoDay(d);
                const on = date === v;
                return (
                  <button key={v} type="button" onClick={() => setDate(v)} aria-pressed={on}
                    className={`min-w-[68px] shrink-0 rounded-2xl border-2 px-3 py-2.5 text-center transition-all ${on ? "border-ink bg-ink text-white shadow-lg shadow-ink/20" : "border-ink/10 bg-white text-ink hover:border-ink/30"}`}>
                    <span className={`block text-[10px] font-bold uppercase tracking-widest ${on ? "text-lime" : "text-ink/50"}`}>{d.toLocaleDateString("fr-FR", { weekday: "short" })}</span>
                    <span className="block font-display text-xl font-black">{d.getDate()}</span>
                    <span className={`block text-xs ${on ? "text-white/70" : "text-ink/50"}`}>{d.toLocaleDateString("fr-FR", { month: "short" })}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 2. Court */}
          <section className="card p-6 md:p-8">
            <StepTitle n={2} title="Le court" hint="Tarif par heure, éclairage compris en soirée." />
            {loading && courts.length === 0 ? (
              <div className="grid gap-3 sm:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-44 rounded-2xl" />)}</div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-3">
                {courts.map((c) => {
                  const on = courtId === c.id;
                  return (
                    <button key={c.id} type="button" onClick={() => { setCourtId(c.id); setStart(""); }} aria-pressed={on}
                      className={`${optionCls(on)} overflow-hidden !p-0 text-left`}>
                      <img src={c.image ?? ""} alt="" className="aspect-[12/7] w-full object-cover" />
                      <SelectedTick show={on} />
                      <div className="p-4">
                        <p className="font-bold text-ink">{c.name}</p>
                        <p className="text-xs text-muted">{c.surface}</p>
                        <p className="mt-2 font-display text-lg font-black text-brand">{xof(c.pricePerSlot * 2)}<span className="font-sans text-xs font-semibold text-muted"> /h</span></p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* 3. Créneau */}
          <section className="card p-6 md:p-8">
            <StepTitle n={3} title="Le créneau" hint="Touchez l'heure de début."
              aside={
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-ink/50"><Clock size={14} /> Durée</span>
                  <div className={segWrap} role="group" aria-label="Durée">
                    {[2, 3, 4].map((n) => (
                      <button key={n} type="button" aria-pressed={slots === n} onClick={() => { setSlots(n); if (start && !rangeFree(start, n)) setStart(""); }} className={segItem(slots === n)}>
                        {n === 2 ? "1 h" : n === 3 ? "1 h 30" : "2 h"}
                      </button>
                    ))}
                  </div>
                </div>
              } />
            {loading ? (
              <div className="flex justify-center py-10 text-ink/40"><Loader2 className="animate-spin" /></div>
            ) : (
              <>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
                  {SLOTS.map((slot) => {
                    const taken = slotTaken(slot);
                    const canStart = rangeFree(slot, slots);
                    const sel = selected(slot);
                    return (
                      <button key={slot} type="button" disabled={taken || (!canStart && !sel)} onClick={() => setStart(slot)} aria-pressed={sel}
                        className={`tabular rounded-xl border-2 py-2.5 text-sm font-bold transition-all ${
                          sel ? "border-ink bg-ink text-white" : taken ? "cursor-not-allowed border-transparent bg-cloud text-ink/30 line-through" : canStart ? "border-ink/10 bg-white text-ink/80 hover:border-brand hover:text-brand" : "border-ink/[0.05] bg-white text-ink/25"}`}>
                        {slot}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-5 flex flex-wrap gap-4 text-xs text-muted">
                  <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded border-2 border-ink/10 bg-white" /> Libre</span>
                  <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-ink" /> Votre sélection</span>
                  <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-cloud" /> Déjà réservé</span>
                </div>
              </>
            )}
          </section>

          {/* 4. Coach */}
          <section className="card p-6 md:p-8">
            <StepTitle n={4} title="Un coach ?" hint="Facultatif : transformez votre créneau en cours particulier." />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              <button type="button" onClick={() => setCoachId("")} aria-pressed={!coachId}
                className={`${optionCls(!coachId)} flex flex-col items-center justify-center text-center text-sm font-bold text-ink`}>
                <SelectedTick show={!coachId} />
                <span className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-mist text-ink/40"><User /></span>
                Sans coach
              </button>
              {coaches.map((c) => {
                const on = coachId === c.id;
                return (
                  <button key={c.id} type="button" onClick={() => setCoachId(c.id)} aria-pressed={on} className={`${optionCls(on)} text-center text-sm`}>
                    <SelectedTick show={on} />
                    <img src={c.photo ?? ""} alt="" className="mx-auto h-14 w-14 rounded-full object-cover" />
                    <p className="mt-2 font-bold text-ink">{c.firstName}</p>
                    <p className="text-xs font-semibold text-brand">+{xof(c.hourlyRate)}/h</p>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {/* Récapitulatif collant */}
        <aside className="lg:sticky lg:top-6 lg:col-span-4">
          <div className="relative overflow-hidden rounded-[2rem] bg-ink p-6 text-white shadow-xl shadow-ink/15 md:p-7">
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-lime/15 blur-3xl" aria-hidden />
            <p className="relative text-[11px] font-bold uppercase tracking-[0.25em] text-lime">Récapitulatif</p>
            {court && <img src={court.image ?? ""} alt="" className="relative mt-4 aspect-[12/6] w-full rounded-2xl object-cover opacity-90" />}
            <div className="relative mt-3">
              <SummaryRow label="Date" value={<span className="capitalize">{new Date(`${date}T12:00:00`).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</span>} />
              <SummaryRow label="Court" value={court ? `${court.name} · ${court.surface}` : "—"} />
              <SummaryRow label="Horaire" value={start ? <span className="inline-flex items-center gap-1.5"><Clock size={13} className="text-lime" />{start} – {endLabel}</span> : "Choisissez un créneau"} />
              <SummaryRow label="Coach" value={coach ? `${coach.firstName} ${coach.lastName}` : "Aucun"} />
            </div>
            <div className="relative mt-2 space-y-1.5 rounded-2xl bg-white/[0.06] p-4 text-sm">
              <div className="flex justify-between gap-3"><span className="text-white/55">Court ({slots / 2} h)</span><span className="tabular font-semibold">{xof(courtPrice)}</span></div>
              {coach && <div className="flex justify-between gap-3"><span className="text-white/55">Coach</span><span className="tabular font-semibold">{xof(coachPrice)}</span></div>}
            </div>
            <div className="relative mt-5 flex items-end justify-between gap-3">
              <span className="text-sm text-white/60">Total à régler</span>
              <span className="tabular font-display text-3xl font-black text-lime">{xof(total)}</span>
            </div>
            {error && <p role="alert" className="relative mt-5 rounded-2xl bg-red-500/90 px-4 py-3 text-sm font-semibold text-white">{error}</p>}
            <button type="button" onClick={submit} disabled={!start || !court || submitting} className="btn-accent relative mt-6 w-full">
              {submitting && <Loader2 size={16} className="animate-spin" />} Continuer vers le paiement
            </button>
            <p className="relative mt-4 flex items-center justify-center gap-2 text-xs text-white/55"><ShieldCheck size={14} className="text-lime" /> Annulation gratuite jusqu'à 24 h avant.</p>
          </div>
          <p className="mt-4 flex items-center justify-center gap-2 text-xs text-muted"><CalendarDays size={14} /> Paiement par MTN Mobile Money ou carte</p>
        </aside>
      </div>
    </div>
  );
}
