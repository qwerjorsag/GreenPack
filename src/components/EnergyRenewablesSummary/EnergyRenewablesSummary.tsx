import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

type EnergyByPeriod = Record<string, number | ''>;

interface Props {
  years: number[];
  values: EnergyByPeriod[];
}

const formatWithSpaces = (value: number) => {
  return value.toLocaleString('cs-CZ').replace(/\u00A0/g, ' ');
};

export default function EnergyRenewablesSummary({ years, values }: Props) {
  const { i18n } = useTranslation();
  const isCs = i18n.language === 'cs';

  const rows = useMemo(() => {
    return years.map((year, idx) => {
      const periodValues = values[idx] || {};
      const total = Object.values(periodValues).reduce((sum, v) => sum + (typeof v === 'number' ? v : 0), 0);
      const renewable = typeof periodValues.electricity_renewable === 'number' ? periodValues.electricity_renewable : 0;
      const nonRenewable = Math.max(0, total - renewable);
      const renewablePct = total > 0 ? (renewable / total) * 100 : 0;
      const nonRenewablePct = total > 0 ? (nonRenewable / total) * 100 : 0;
      return { year, total, renewable, nonRenewable, renewablePct, nonRenewablePct };
    });
  }, [years, values]);

  const renewableClass = (pct: number) => {
    if (pct > 50) return 'text-emerald-700';
    if (pct < 10) return 'text-red-700';
    if (pct >= 10 && pct <= 25) return 'text-amber-700';
    return 'text-stone-700';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-stone-900">
          {isCs ? 'Obnovitelné zdroje' : 'Renewable sources'}
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-stone-500 uppercase bg-stone-50">
            <tr>
              <th className="px-4 py-3 rounded-tl-xl">{isCs ? 'Rok' : 'Year'}</th>
              <th className="px-4 py-3 text-center">{isCs ? 'Obnovitelné (kWh)' : 'Renewable (kWh)'}</th>
              <th className="px-4 py-3 rounded-tr-xl text-center">{isCs ? 'Neobnovitelné (kWh)' : 'Non-renewable (kWh)'}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.year} className="border-b border-stone-100 last:border-0">
                <td className="px-4 py-3 font-medium">{row.year}</td>
                <td className={`px-4 py-3 text-center ${renewableClass(row.renewablePct)}`}>
                  {formatWithSpaces(row.renewable)} ({row.renewablePct.toFixed(1).replace('.', ',')}%)
                </td>
                <td className="px-4 py-3 text-center">
                  {formatWithSpaces(row.nonRenewable)} ({row.nonRenewablePct.toFixed(1).replace('.', ',')}%)
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
