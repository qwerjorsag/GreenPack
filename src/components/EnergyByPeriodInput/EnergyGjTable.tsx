import React from 'react';
import { ENERGY_SOURCES } from '../EnergyEmissionsInput';

type EnergyByPeriod = Record<string, number | ''>;

type Props = {
  isCs: boolean;
  periods: { period: string }[];
  values: EnergyByPeriod[];
  showUnits: boolean;
  totals: number[];
  formatGj: (value: number) => string;
};

export default function EnergyGjTable({
  isCs,
  periods,
  values,
  showUnits,
  totals,
  formatGj,
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
                key={`gj-period-${idx}`}
                className={`gp-th gp-th-center whitespace-normal break-words w-1/3 ${idx === 2 ? 'gp-th-right' : ''}`}
              >
                {p.period || (isCs ? `Období ${idx + 1}` : `Period ${idx + 1}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ENERGY_SOURCES.map((source) => (
            <tr key={`${source.id}-gj`} className="gp-row">
              <td className="gp-td">
                <span className="text-sm font-medium text-stone-800">
                  {isCs ? source.nameCs : source.nameEn}
                </span>
              </td>
              {periods.map((_, idx) => {
                const val = values[idx]?.[source.id];
                const kwh = typeof val === 'number' ? val : 0;
                const gj = kwh * 0.0036;
                return (
                  <td key={`${source.id}-gj-${idx}`} className="gp-td gp-td-center w-1/3">
                    <span className="whitespace-nowrap">
                      {formatGj(gj)}
                      {showUnits && <span className="text-xs text-stone-500"> GJ</span>}
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
                key={`gj-total-${idx}`}
                className={`gp-td gp-td-center w-1/3 ${idx === totals.length - 1 ? 'rounded-br-xl' : ''}`}
              >
                <span className="whitespace-nowrap">
                  {formatGj(total)}
                  {showUnits && <span className="text-xs text-stone-500"> GJ</span>}
                </span>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
