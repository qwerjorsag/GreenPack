import React from 'react';
import { ENERGY_SOURCES } from '../EnergyEmissionsInput';

type EnergyByPeriod = Record<string, number | ''>;

type Props = {
  isCs: boolean;
  periods: { period: string }[];
  values: EnergyByPeriod[];
  showUnits: boolean;
  totals: number[];
  formatEmissions: (value: number) => string;
};

export default function EnergyEmissionsTable({
  isCs,
  periods,
  values,
  showUnits,
  totals,
  formatEmissions,
}: Props) {
  return (
    <div className="overflow-x-auto overflow-y-visible pb-4">
      <table className="w-full text-sm text-left tabular-nums table-fixed">
        <thead className="text-xs text-stone-500 uppercase bg-stone-50">
          <tr>
            <th className="pl-4 pr-1 py-3 rounded-tl-xl whitespace-normal break-words max-w-[140px] md:max-w-none w-1/3">
              {isCs ? 'Zdroj energie' : 'Energy source'}
            </th>
            {periods.map((p, idx) => (
              <th
                key={`emission-period-${idx}`}
                className={`px-3 py-3 text-center whitespace-normal break-words w-1/3 ${idx === 2 ? 'rounded-tr-xl' : ''}`}
              >
                {p.period || (isCs ? `Období ${idx + 1}` : `Period ${idx + 1}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ENERGY_SOURCES.map((source) => (
            <tr key={`${source.id}-em`} className="border-b border-stone-100 last:border-0">
              <td className="pl-4 pr-1 py-3">
                <span className="text-sm font-medium text-stone-800">
                  {isCs ? source.nameCs : source.nameEn}
                </span>
              </td>
              {periods.map((_, idx) => {
                const val = values[idx]?.[source.id];
                const kwh = typeof val === 'number' ? val : 0;
                const emissions = (kwh * source.ef) / 1000;
                return (
                  <td key={`${source.id}-em-${idx}`} className="px-3 py-3 text-center w-1/3">
                    <span className="whitespace-nowrap">
                      {formatEmissions(emissions)}
                      {showUnits && <span className="text-xs text-stone-500"> t CO₂e</span>}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
          <tr className="font-bold bg-stone-100 text-stone-900">
            <td className="pl-4 pr-1 py-3 uppercase rounded-bl-xl">
              {isCs ? 'Celkem' : 'Total'}
            </td>
            {totals.map((total, idx) => (
              <td
                key={`em-total-${idx}`}
                className={`px-3 py-3 text-center w-1/3 ${idx === totals.length - 1 ? 'rounded-br-xl' : ''}`}
              >
                <span className="whitespace-nowrap">
                  {formatEmissions(total)}
                  {showUnits && <span className="text-xs text-stone-500"> t CO₂e</span>}
                </span>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
