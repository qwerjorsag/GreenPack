import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import DataTable from '../DataTable';

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

      <DataTable
        columns={[
          {
            id: 'year',
            header: isCs ? 'Rok' : 'Year',
            headerClassName: 'px-4 py-3 rounded-tl-xl',
            cellClassName: 'px-4 py-3 font-medium',
          },
          {
            id: 'renewable',
            header: isCs ? 'Obnovitelné (kWh)' : 'Renewable (kWh)',
            headerClassName: 'px-4 py-3 text-center',
            cellClassName: 'px-4 py-3 text-center',
            render: (row) => (
              <span className={renewableClass(row.renewablePct)}>
                {formatWithSpaces(row.renewable)} ({row.renewablePct.toFixed(1).replace('.', ',')}%)
              </span>
            ),
          },
          {
            id: 'nonRenewable',
            header: isCs ? 'Neobnovitelné (kWh)' : 'Non-renewable (kWh)',
            headerClassName: 'px-4 py-3 rounded-tr-xl text-center',
            cellClassName: 'px-4 py-3 text-center',
            render: (row) => (
              <span>
                {formatWithSpaces(row.nonRenewable)} ({row.nonRenewablePct.toFixed(1).replace('.', ',')}%)
              </span>
            ),
          },
        ]}
        rows={rows}
        getRowId={(row) => row.year}
      />
    </div>
  );
}
