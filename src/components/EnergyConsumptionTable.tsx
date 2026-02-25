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
      return { row, target, byYear };
    });
  }, [rows, years, values, denominators]);

  const unitLabel = (unit: string) => {
    if (!isCs) return unit;
    return unit.replace('RN', 'PN').replace('/year', '/rok');
  };

  return (
    <div className="energy-consumption-table">
      {computed.map(({ row, byYear }) => (
        <div key={row.id} className="table-block">
          <div className="table-title">
            {row.id === 'total-energy' ? t.totalEnergy : row.id === 'total-energy-alt' ? t.totalEnergyAlt : row.indicatorName}
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th className="sticky left col-year">{t.year}</th>
                  {years.map((year) => (
                    <th key={`${row.id}-year-${year}`}>{year}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="sticky left col-year">{t.raw} ({row.baseUnit})</td>
                  {byYear.map((cell) => (
                    <td key={`${row.id}-raw-${cell.year}`} className="text-center">{formatNumber(cell.raw, 0)}</td>
                  ))}
                </tr>
                <tr>
                  <td className="sticky left col-year">{t.converted}</td>
                  {byYear.map((cell) => (
                    <td key={`${row.id}-conv-${cell.year}`} className="text-center">{formatNumber(cell.converted, 2)}</td>
                  ))}
                </tr>
                <tr>
                  <td className="sticky left col-year">
                    {t.normalized} ({unitLabel(row.normalizationTargets[0].unitLabel)})
                  </td>
                  {byYear.map((cell) => (
                    <td key={`${row.id}-norm-${cell.year}`} className="text-center">{formatNumber(cell.normalized, 3)}</td>
                  ))}
                </tr>
                <tr>
                  <td className="sticky left col-year">{t.percentChange}</td>
                  {byYear.map((cell, idx) => {
                    const previous = idx > 0 ? byYear[idx - 1] : null;
                    const pct = percentChange(cell.raw, previous?.raw ?? null);
                    return (
                      <td key={`${row.id}-pct-${cell.year}`} className="text-center">
                        {pct === null ? '—' : `${formatNumber(pct, 1)}%`}
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td className="sticky left col-year">{t.evaluation}</td>
                  {byYear.map((cell, idx) => {
                    const previous = idx > 0 ? byYear[idx - 1] : null;
                    const pct = percentChange(cell.raw, previous?.raw ?? null);
                    const evalInfo = evaluateDisplay(pct, isCs);
                    return (
                      <td key={`${row.id}-eval-${cell.year}`} className={`eval ${evalInfo.color} text-center`}>
                        {evalInfo.label}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
          <div className="report-block">
            <div className="report-title">
              {(isCs ? 'Report ' : 'Report ') +
                (row.id === 'total-energy' ? t.totalEnergy : row.id === 'total-energy-alt' ? t.totalEnergyAlt : row.indicatorName)}
            </div>
            <div className="report-list">
              {byYear.map((cell, idx) => {
                if (idx === 0) return null;
                const previous = byYear[idx - 1];
                const pct = percentChange(cell.raw, previous?.raw ?? null);
                const category = reportCategory(pct);
                const text = reportText(pct, category, isCs);
                return (
                  <div key={`${row.id}-report-${cell.year}`} className="report-item">
                    <span className="report-year">{previous.year} → {cell.year}:</span> {text}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}

      <style>{`
        .energy-consumption-table {
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif;
          color: #1c1917;
        }
        .table-block { margin-bottom: 20px; }
        .table-title { font-size: 18px; font-weight: 700; margin-bottom: 8px; color: #1c1917; }
        .table-wrap {
          overflow-x: auto;
          border: 1px solid #e7e5e4;
          border-radius: 14px;
          background: white;
        }
        table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          min-width: 320px;
          table-layout: auto;
        }
        thead th {
          position: sticky;
          top: 0;
          background: #f5f5f4;
          color: #78716c;
          font-size: 11px;
          text-transform: uppercase;
          z-index: 2;
          border-bottom: 1px solid #e7e5e4;
        }
        th, td {
          padding: 8px;
          border-bottom: 1px solid #f0f0ef;
          vertical-align: top;
          background: white;
          font-size: 0.875rem;
        }
        .sticky.left {
          position: sticky;
          left: 0;
          z-index: 3;
          background: #fafaf9;
        }
        .col-year { min-width: 64px; text-align: center; }
        th, td { word-break: break-word; }
        .eval.red { background: #fee2e2; color: #991b1b; font-weight: 600; }
        .eval.green { background: #dcfce7; color: #166534; font-weight: 600; }
        .eval.orange { background: #ffedd5; color: #9a3412; font-weight: 600; }
        .eval.neutral { background: #f5f5f4; color: #57534e; font-weight: 600; }
        .report-block {
          margin-top: 8px;
          padding: 10px 12px;
          border: 1px solid #e7e5e4;
          border-radius: 12px;
          background: #fafaf9;
        }
        .report-title { font-weight: 700; font-size: 16px; margin-bottom: 6px; color: #1c1917; }
        .report-list { display: grid; gap: 6px; font-size: 14px; color: #57534e; }
        .report-year { font-weight: 600; color: #1c1917; }
      `}</style>
    </div>
  );
}
