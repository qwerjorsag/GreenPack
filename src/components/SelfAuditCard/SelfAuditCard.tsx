import React from 'react';

interface SelfAuditCardProps {
  title: string;
  description: string;
  value: number | '';
  onChange: (value: string) => void;
  score: number;
  icon: React.ReactNode;
}

export default function SelfAuditCard({
  title,
  description,
  value,
  onChange,
  score,
  icon,
}: SelfAuditCardProps) {
  return (
    <div className="bg-white p-8 rounded-3xl border border-yellow-200 shadow-sm">
      <div className="mb-4 text-yellow-600">{icon}</div>
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <p className="text-stone-500 text-sm leading-relaxed mb-6">{description}</p>

      <div className="flex items-center gap-4">
        <input
          type="number"
          inputMode="numeric"
          min={0}
          max={100}
          placeholder="0–100"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
        <div className="min-w-[84px] text-right text-sm font-semibold text-yellow-800">
          {score} / 100
        </div>
      </div>
    </div>
  );
}
