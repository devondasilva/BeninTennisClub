"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

/** Texte coupé à N lignes avec un bouton « Voir plus » (affiché seulement si le texte dépasse) */
export default function ExpandableText({ text, lines = 3, className = "" }: { text: string; lines?: number; className?: string }) {
  const [open, setOpen] = useState(false);
  const [overflow, setOverflow] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (el) setOverflow(el.scrollHeight > el.clientHeight + 2);
  }, [text]);

  return (
    <div>
      <p ref={ref} className={className} style={open ? undefined : { display: "-webkit-box", WebkitLineClamp: lines, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
        {text}
      </p>
      {(overflow || open) && (
        <button type="button" onClick={() => setOpen(!open)} className="mt-1 inline-flex items-center gap-0.5 text-sm font-semibold text-primary-400 hover:underline">
          {open ? <>Voir moins <ChevronUp size={15} /></> : <>Voir plus <ChevronDown size={15} /></>}
        </button>
      )}
    </div>
  );
}
