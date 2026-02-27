import React from 'react';

type Props = {
  isCs: boolean;
  totalWaterM3: number;
  recycledShare: number;
  perRoomNightM3: number;
};

const formatWithSpaces = (value: number) => {
  return value.toLocaleString('cs-CZ').replace(/\u00A0/g, ' ');
};

export default function WaterSummaryCard({ isCs, totalWaterM3, recycledShare, perRoomNightM3 }: Props) {
  return (
    <div className="gp-card-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <h3>{isCs ? 'Co měříme?' : 'What we measure?'}</h3>
          <ul className="space-y-4 mt-6">
            {[
              {
                label: isCs ? 'Celková spotřeba vody (m³)' : 'Total water consumption (m³)',
                value: `${formatWithSpaces(totalWaterM3)} m³`,
              },
              {
                label: isCs ? 'Recyklovaná voda (%)' : 'Recycled water (%)',
                value: `${recycledShare.toFixed(1).replace('.', ',')} %`,
              },
              {
                label: isCs ? 'Spotřeba na pokojonoc (m³)' : 'Consumption per room-night (m³)',
                value: `${perRoomNightM3.toFixed(3).replace('.', ',')} m³`,
              },
            ].map((item, i) => (
              <li key={i} className="flex justify-between items-center p-4 bg-stone-50 rounded-2xl">
                <span className="text-stone-600 font-medium">{item.label}</span>
                <span className="px-3 py-1 bg-white border border-stone-200 rounded-lg text-xs font-bold">
                  {item.value}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3>{isCs ? 'Proč je to důležité?' : 'Why it matters?'}</h3>
          <p className="text-stone-500 leading-relaxed mb-6 mt-6">
            {isCs
              ? 'Snížení spotřeby vody o 20 % může ušetřit tisíce eur ročně na poplatcích za vodné a stočné.'
              : 'Reducing water consumption by 20% can save thousands of euros per year in water and sewage fees.'}
          </p>
          <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100">
            <p className="text-blue-800 text-sm font-medium italic">
              "Water is the driving force of all nature." — Leonardo da Vinci
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
