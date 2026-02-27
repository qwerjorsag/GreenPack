import React from 'react';

type Props = {
  isCs: boolean;
  totalEnergyKwh: number;
  renewableShare: number;
  perRoomNightKwh: number;
};

const formatWithSpaces = (value: number) => {
  return value.toLocaleString('cs-CZ').replace(/\u00A0/g, ' ');
};

export default function ElectricitySummaryCard({ isCs, totalEnergyKwh, renewableShare, perRoomNightKwh }: Props) {
  return (
    <div className="gp-card-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <h3>{isCs ? 'Co měříme?' : 'What we measure?'}</h3>
          <ul className="space-y-4 mt-6">
            {[
              {
                label: isCs ? 'Celková spotřeba energie (kWh)' : 'Total energy consumption (kWh)',
                value: `${formatWithSpaces(totalEnergyKwh)} kWh`,
              },
              {
                label: isCs ? 'Podíl obnovitelné elektřiny (%)' : 'Share of renewable electricity (%)',
                value: `${renewableShare.toFixed(1).replace('.', ',')} %`,
              },
              {
                label: isCs ? 'Spotřeba na pokojonoc (kWh)' : 'Consumption per room-night (kWh)',
                value: `${perRoomNightKwh.toFixed(2).replace('.', ',')} kWh`,
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
              ? 'Energetická náročnost má přímý vliv na provozní náklady i uhlíkovou stopu. Sledování spotřeby pomáhá rychle odhalit úspory.'
              : 'Energy intensity directly affects operating costs and carbon footprint. Tracking consumption helps reveal savings quickly.'}
          </p>
          <div className="p-6 bg-yellow-50 rounded-3xl border border-yellow-100">
            <p className="text-yellow-900 text-sm font-medium italic">
              "Energy efficiency is the fastest, cheapest and cleanest way to reduce emissions." — International Energy Agency
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
