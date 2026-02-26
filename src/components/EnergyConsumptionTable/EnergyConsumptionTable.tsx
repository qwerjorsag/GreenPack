// EnergyConsumptionTable: extend templateRows below to add new indicators.
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

type NormalizationTarget = {
  id: string;
  label: string;
  divisorKey: 'roomNights' | 'floorAreaM2';
  unitLabel: string;
};

type IndicatorRow = {
  id: string;
  indicatorName: string;
  description: string;
  dataSource: string;
  baseUnit: string;
  conversionFactorToGJ: number;
  normalizationTargets: NormalizationTarget[];
};

type DenominatorsByYear = Record<number, { roomNights: number | null; floorAreaM2: number | null }>;
type ValuesByRow = Record<string, Record<number, number | null>>;

const templateRows: IndicatorRow[] = [
  {
    id: 'total-energy',
    indicatorName: 'Total energy consumption per year',
    description:
      'Total amount of energy consumed by the accommodation facility for the selected period – electricity, gas, heating, etc.',
    dataSource: 'Energy invoices / internal metering systems',
    baseUnit: 'kWh',
    conversionFactorToGJ: 0.0036,
    normalizationTargets: [
      { id: 'perRoomNight', label: 'GJ/RN', divisorKey: 'roomNights', unitLabel: 'GJ/RN' },
      { id: 'perM2Year', label: 'GJ/m²/year', divisorKey: 'floorAreaM2', unitLabel: 'GJ/m²/year' },
    ],
  },
  {
    id: 'total-energy-alt',
    indicatorName: 'Total energy consumption per year (alt view)',
    description: 'Same indicator, shown with alternative normalization.',
    dataSource: 'Energy invoices / internal metering systems',
    baseUnit: 'kWh',
    conversionFactorToGJ: 0.0036,
    normalizationTargets: [
      { id: 'perM2Year', label: 'GJ/m²/year', divisorKey: 'floorAreaM2', unitLabel: 'GJ/m²/year' },
      { id: 'perRoomNight', label: 'GJ/RN', divisorKey: 'roomNights', unitLabel: 'GJ/RN' },
    ],
  },
];

const defaultYears = [2027, 2028, 2029];

const labels = {
  en: {
    year: 'Year',
    indicator: 'Indicator',
    raw: 'Consumption',
    converted: 'Consumption (GJ)',
    normalized: 'Normalized',
    percentChange: '% change',
    evaluation: 'Evaluation',
    totalEnergy: 'Total energy consumption per room-night (RN)',
    totalEnergyAlt: 'Total energy consumption per m² per year',
  },
  cs: {
    year: 'Rok',
    indicator: 'Ukazatel',
    raw: 'Spotřeba',
    converted: 'Spotřeba (GJ)',
    normalized: 'Normalizace',
    percentChange: '% změna',
    evaluation: 'Evaluace',
    totalEnergy: 'Celková spotřeba na pokojonoc (PN)',
    totalEnergyAlt: 'Celková spotřeba na m² za rok',
  },
} as const;

const formatNumber = (value: number | null, decimals = 2) => {
  if (value === null || Number.isNaN(value)) return '—';
  return value.toLocaleString('cs-CZ', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

const percentChange = (current: number | null, previous: number | null) => {
  if (current === null || previous === null || previous === 0) return null;
  return ((current - previous) / previous) * 100;
};

const evaluateDisplay = (pct: number | null, isCs: boolean) => {
  if (pct === null || Number.isNaN(pct)) return { label: '—', color: 'neutral' as const };
  const abs = Math.abs(pct);
  if (abs >= 10) {
    return {
      label: pct > 0 ? (isCs ? 'Výrazný nárůst' : 'Significant increase') : (isCs ? 'Výrazné zlepšení' : 'Significant decrease'),
      color: pct > 0 ? 'red' : 'green',
    };
  }
  if (abs >= 5) return { label: isCs ? 'Střední změna' : 'Moderate change', color: 'orange' as const };
  return { label: isCs ? 'Malá změna' : 'Minor change', color: 'neutral' as const };
};

const reportCategory = (pct: number | null) => {
  if (pct === null || Number.isNaN(pct)) return 'none' as const;
  const abs = Math.abs(pct);
  if (abs >= 20) return 'key' as const;
  if (abs >= 10) return 'significant' as const;
  if (abs >= 5) return 'notable' as const;
  return 'normal' as const;
};

const reportText = (
  pct: number | null,
  category: 'normal' | 'notable' | 'significant' | 'key' | 'none',
  isCs: boolean
) => {
  if (pct === null || Number.isNaN(pct)) return '—';
  const isDecrease = pct < 0;
  if (category === 'normal') {
    return isCs
      ? 'Stabilní trend – udržujte současné postupy a motivujte personál.'
      : 'Stable trend – maintain current practices and keep staff motivated.';
  }
  if (category === 'notable') {
    return isDecrease
      ? (isCs ? 'Mírné zlepšení – sledujte, zda trend pokračuje.' : 'Slight improvement observed – monitor if the trend continues.')
      : (isCs ? 'Mírný nárůst spotřeby – prověřte možné důvody.' : 'Slight increase in consumption – analyze possible reasons.');
  }
  if (category === 'significant') {
    return isDecrease
      ? (isCs ? 'Skvělé! Výrazné zlepšení – zahrňte do ESG reportu a inspirujte ostatní.' : 'Great! Significant improvement – include in ESG report and inspire others.')
      : (isCs ? 'Výrazný nárůst – doporučena detailní analýza a akční plán.' : 'Significant increase – detailed analysis and action plan recommended.');
  }
  if (category === 'key') {
    return isDecrease
      ? (isCs ? 'Výrazné zlepšení – analyzujte, co fungovalo, a standardizujte postup.' : 'Major improvement – analyze what worked and standardize the approach.')
      : (isCs ? 'Výrazné zhoršení – nutná okamžitá akce a optimalizace.' : 'Major deterioration – immediate action and optimization needed.');
  }
  return '—';
};

interface EnergyConsumptionTableProps {
  years?: number[];
  denominators?: DenominatorsByYear;
  values?: ValuesByRow;
}

export default function EnergyConsumptionTable({
  years: yearsProp,
  denominators: denominatorsProp,
  values: valuesProp,
}: EnergyConsumptionTableProps) {
  const { i18n } = useTranslation();
  const isCs = i18n.language === 'cs';
  const t = isCs ? labels.cs : labels.en;

  const years = yearsProp && yearsProp.length ? yearsProp : defaultYears;
  const rows = templateRows;
  const denominators = denominatorsProp || Object.fromEntries(years.map((y) => [y, { roomNights: null, floorAreaM2: null }]));
  const values = valuesProp || Object.fromEntries(rows.map((r) => [r.id, Object.fromEntries(years.map((y) => [y, null]))]));

  const computed = useMemo(() => {
    return rows.map((row) => {
      const target = row.normalizationTargets[0];
      const byYear = years.map((year) => {
        const raw = values[row.id]?.[year] ?? null;
        const converted = raw === null ? null : raw * row.conversionFactorToGJ;
        const denom = denominators[year]?.[target.divisorKey] ?? null;
        const normalized = converted === null || denom === null || denom === 0 ? null : converted / denom;
        return { year, raw, converted, normalized };
      });
      return { row, byYear };
    });
  }, [rows, years, values, denominators]);

  const unitLabel = (unit: string) => {
    if (!isCs) return unit;
    return unit.replace('RN', 'PN').replace('/year', '/rok');
  };

  const evalClass = (color: string) => {
    if (color === 'red') return 'bg-red-100 text-red-700';
    if (color === 'green') return 'bg-emerald-100 text-emerald-700';
    if (color === 'orange') return 'bg-amber-100 text-amber-700';
    return 'bg-stone-100 text-stone-600';
  };

  return (
    <div className="space-y-6">
      {computed.map(({ row, byYear }) => (
        <div key={row.id}>
          <h3 className="mb-3">
            {row.id === 'total-energy' ? t.totalEnergy : row.id === 'total-energy-alt' ? t.totalEnergyAlt : row.indicatorName}
          </h3>
          <div className="gp-table-wrap">
            <table className="gp-table">
              <thead className="gp-table-head">
                <tr>
                  <th className="gp-th gp-th-left">{t.year}</th>
                  {years.map((year, idx) => (
                    <th
                      key={year}
                      className={`gp-th gp-th-center ${idx === years.length - 1 ? 'gp-th-right' : ''}`}
                    >
                      {year}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { key: 'raw', label: `${t.raw} (${row.baseUnit})`, values: byYear.map((c) => formatNumber(c.raw, 0)) },
                  { key: 'converted', label: t.converted, values: byYear.map((c) => formatNumber(c.converted, 2)) },
                  { key: 'normalized', label: `${t.normalized} (${unitLabel(row.normalizationTargets[0].unitLabel)})`, values: byYear.map((c) => formatNumber(c.normalized, 3)) },
                  {
                    key: 'percent',
                    label: t.percentChange,
                    values: byYear.map((cell, idx) => {
                      const previous = idx > 0 ? byYear[idx - 1] : null;
                      const pct = percentChange(cell.raw, previous?.raw ?? null);
                      return pct === null ? '—' : `${formatNumber(pct, 1)}%`;
                    }),
                  },
                  {
                    key: 'evaluation',
                    label: t.evaluation,
                    values: byYear.map((cell, idx) => {
                      const previous = idx > 0 ? byYear[idx - 1] : null;
                      const pct = percentChange(cell.raw, previous?.raw ?? null);
                      return evaluateDisplay(pct, isCs);
                    }),
                  },
                ].map((rowItem) => (
                  <tr key={rowItem.key} className="gp-row">
                    <td className="gp-td font-medium">{rowItem.label}</td>
                    {rowItem.values.map((value, idx) => (
                      <td key={`${rowItem.key}-${idx}`} className="gp-td gp-td-center">
                        {rowItem.key === 'evaluation' && value && typeof value === 'object' ? (
                          <span className={`inline-block px-2 py-1 rounded-md text-xs font-semibold ${evalClass(value.color)}`}>
                            {value.label}
                          </span>
                        ) : (
                          value
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 mb-6 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
            <div className="gp-subtitle mb-2">
              {(isCs ? 'Report ' : 'Report ') +
                (row.id === 'total-energy' ? t.totalEnergy : row.id === 'total-energy-alt' ? t.totalEnergyAlt : row.indicatorName)}
            </div>
            <div className="grid gap-2 text-sm text-stone-600">
              {byYear.map((cell, idx) => {
                if (idx === 0) return null;
                const previous = byYear[idx - 1];
                const pct = percentChange(cell.raw, previous?.raw ?? null);
                const category = reportCategory(pct);
                const text = reportText(pct, category, isCs);
                return (
                  <div key={`${row.id}-report-${cell.year}`}>
                    <span className="font-semibold text-stone-900">{previous.year} → {cell.year}:</span> {text}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
