export function xof(amount: number) {
  return new Intl.NumberFormat("fr-FR").format(Math.round(amount)) + " XOF";
}

export function dateFr(d: Date | string, opts?: Intl.DateTimeFormatOptions) {
  return new Date(d).toLocaleDateString("fr-FR", opts ?? { day: "numeric", month: "long", year: "numeric" });
}

export function timeFr(d: Date | string) {
  return new Date(d).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export function relativeFr(d: Date | string) {
  const diff = (Date.now() - new Date(d).getTime()) / 1000;
  if (diff < 60) return "à l'instant";
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
  const days = Math.floor(diff / 86400);
  if (days === 1) return "hier";
  if (days < 30) return `il y a ${days} jours`;
  return dateFr(d);
}

export function daysUntil(d: Date | string) {
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
}

export const STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: "En attente de paiement",
  PENDING: "En attente",
  CONFIRMED: "Confirmé",
  CANCELLED: "Annulé",
  COMPLETED: "Terminé",
  PAID: "Payé",
  SHIPPED: "Expédié",
  DELIVERED: "Livré",
  FAILED: "Échoué",
  REFUNDED: "Remboursé",
  IN_PROGRESS: "En cours",
  READY_FOR_PICKUP: "Prêt à récupérer",
  ACTIVE: "Active",
  INACTIVE: "Inactif",
};

export const STATUS_COLORS: Record<string, string> = {
  PENDING_PAYMENT: "bg-amber-100 text-amber-800",
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-gray-200 text-gray-700",
  COMPLETED: "bg-emerald-100 text-emerald-800",
  PAID: "bg-emerald-100 text-emerald-800",
  SHIPPED: "bg-sky-100 text-sky-800",
  DELIVERED: "bg-emerald-100 text-emerald-800",
  FAILED: "bg-red-100 text-red-800",
  REFUNDED: "bg-purple-100 text-purple-800",
  IN_PROGRESS: "bg-sky-100 text-sky-800",
  READY_FOR_PICKUP: "bg-accent-200 text-primary-400",
  ACTIVE: "bg-emerald-100 text-emerald-800",
  INACTIVE: "bg-gray-200 text-gray-700",
};
