import React from 'react';

type Props = {
  isCs: boolean;
  totalWasteKg: number;
  recycledKg: number;
  recyclingRate: number;
};

const formatWithSpaces = (value: number) => {
  return value.toLocaleString('cs-CZ').replace(/\u00A0/g, ' ');
};

export default function WasteSummaryCard({ isCs, totalWasteKg, recycledKg, recyclingRate }: Props) {
  return (
    <div className="gp-card-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <h3>{isCs ? 'Co měříme?' : 'What we measure?'}</h3>
          <ul className="space-y-4 mt-6">
            {[
              {
                label: isCs ? 'Celkový odpad (kg)' : 'Total waste (kg)',
                value: `${formatWithSpaces(totalWasteKg)} kg`,
              },
              {
                label: isCs ? 'Recyklovaný odpad (kg)' : 'Recycled waste (kg)',
                value: `${formatWithSpaces(recycledKg)} kg`,
              },
              {
                label: isCs ? 'Míra recyklace' : 'Recycling rate',
                value: `${recyclingRate.toFixed(1).replace('.', ',')} %`,
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
              ? 'Průměrný hotel vyprodukuje 1 kg odpadu na hosta a noc. Správným tříděním lze recyklovat až 80 % tohoto objemu.'
              : 'The average hotel produces 1 kg of waste per guest per night. With proper sorting, up to 80% of this volume can be recycled.'}
          </p>
          <div className="p-6 bg-stone-100 rounded-3xl border border-stone-200">
            <p className="text-stone-700 text-sm font-medium italic">
              "There is no such thing as 'away'. When we throw anything away, it must go somewhere." — Annie Leonard
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
