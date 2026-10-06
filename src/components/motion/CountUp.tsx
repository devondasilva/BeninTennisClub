"use client";

import { useEffect, useRef } from "react";
import { animate, useInView } from "framer-motion";

/** Nombre qui s'incrémente jusqu'à sa valeur (KPI du tableau de bord). */
export default function CountUp({
  value,
  format = (v: number) => Math.round(v).toLocaleString("fr-FR"),
  duration = 1.2,
  className,
}: {
  value: number;
  format?: (v: number) => string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const from = useRef(0);

  useEffect(() => {
    if (!inView || !ref.current) return;
    const node = ref.current;
    const controls = animate(from.current, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        node.textContent = format(v);
      },
    });
    from.current = value;
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, inView]);

  return (
    <span ref={ref} className={`tabular ${className ?? ""}`}>
      {format(0)}
    </span>
  );
}
