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
      <table className="gp-table tabular-nums table-fixed">
        <thead className="gp-table-head">
          <tr>
            <th className="gp-th gp-th-left whitespace-normal break-words max-w-[140px] md:max-w-none w-1/3">
              {isCs ? 'Zdroj energie' : 'Energy source'}
            </th>
            {periods.map((p, idx) => (
              <th
                key={`emission-period-${idx}`}
                className={`gp-th gp-th-center whitespace-normal break-words w-1/3 ${idx === 2 ? 'gp-th-right' : ''}`}
              >
                {p.period || (isCs ? `Období ${idx + 1}` : `Period ${idx + 1}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ENERGY_SOURCES.map((source) => (
            <tr key={`${source.id}-em`} className="gp-row">
              <td className="gp-td">
                <span className="text-sm font-medium text-stone-800">
                  {isCs ? source.nameCs : source.nameEn}
                </span>
              </td>
              {periods.map((_, idx) => {
                const val = values[idx]?.[source.id];
                const kwh = typeof val === 'number' ? val : 0;
                const emissions = (kwh * source.ef) / 1000;
                return (
                  <td key={`${source.id}-em-${idx}`} className="gp-td gp-td-center w-1/3">
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
            <td className="gp-td uppercase rounded-bl-xl">
              {isCs ? 'Celkem' : 'Total'}
            </td>
            {totals.map((total, idx) => (
              <td
                key={`em-total-${idx}`}
                className={`gp-td gp-td-center w-1/3 ${idx === totals.length - 1 ? 'rounded-br-xl' : ''}`}
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
