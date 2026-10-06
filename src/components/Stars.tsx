import { Star } from "lucide-react";

/** Note sur 5 en étoiles (lecture seule) */
export default function Stars({ value, size = 16, className = "" }: { value: number; size?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`} aria-label={`${value.toFixed(1)} sur 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} aria-hidden className={i <= Math.round(value) ? "fill-amber-400 text-amber-400" : "fill-cloud text-cloud"} />
      ))}
    </span>
  );
}
