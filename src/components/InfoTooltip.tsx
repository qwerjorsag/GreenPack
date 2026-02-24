import React, { useEffect, useRef, useState } from 'react';

interface InfoTooltipProps {
  label: string;
  content: string;
  buttonText?: string;
}

export default function InfoTooltip({ label, content, buttonText }: InfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-stone-800 transition-colors"
        aria-expanded={open}
        aria-label={label}
      >
        {buttonText && <span>{buttonText}</span>}
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-stone-300 bg-white text-stone-600 text-xs font-bold">
          i
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-8 z-50 w-72 rounded-xl border border-stone-200 bg-white p-3 text-sm text-stone-700 shadow-xl">
          <div className="flex items-start justify-between gap-2">
            <div className="font-semibold text-stone-900">{label}</div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-stone-400 hover:text-stone-700 transition-colors"
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <div className="mt-2 leading-relaxed">{content}</div>
        </div>
      )}
    </div>
  );
}