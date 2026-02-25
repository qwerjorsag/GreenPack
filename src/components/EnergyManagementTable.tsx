import React from 'react';
import { useTranslation } from 'react-i18next';
import { energyBenchmarks, MetricKey } from '../data/energyBenchmarks';

interface EnergyManagementTableProps {
  totalEnergyKwh: number | null;
  totalEmissionsKg: number | null;
  floorAreaM2: number | null;
  roomNights: number | null;
  profileId: string;
  periodTitle?: string | null;
}

type Range = { min: number; max: number | null; label: string };

type StatusKey = 'within' | 'slightly' | 'high' | 'lowEmissions' | 'aboveAverage' | 'unknown';

const formatValue = (value: number | null) => {
  if (value === null || Number.isNaN(value)) return '-';
  return value.toLocaleString('cs-CZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const evaluateStatus = (value: number | null, range: Range, key: MetricKey): StatusKey => {
  if (value === null || Number.isNaN(value)) return 'unknown';

  const upperTypical = range.max ?? range.min;
  const limit = upperTypical * 1.25;

  if (key === 'emissionsPerRoomNight') {
    if (value <= upperTypical) return 'lowEmissions';
    if (value <= limit) return 'aboveAverage';
    return 'high';
  }

  if (value <= upperTypical) return 'within';
  if (value <= limit) return 'slightly';

  return 'high';
};

const getStatusClass = (status: StatusKey) => {
  switch (status) {
    case 'within':
    case 'lowEmissions':
      return 'text-emerald-700';
    case 'slightly':
    case 'aboveAverage':
      return 'text-amber-700';
    case 'high':
      return 'text-red-700';
    default:
      return 'text-stone-500';
  }
};

const getStatusText = (status: StatusKey, key: MetricKey, isCs: boolean) => {
  if (status === 'within') return isCs ? 'V typickém rozmezí' : 'Within typical range';
  if (status === 'slightly') return isCs ? 'Mírně nadprůměrné' : 'Slightly above average';
  if (status === 'lowEmissions') return isCs ? 'Nízké emise' : 'Low emissions';
  if (status === 'aboveAverage') return isCs ? 'Nadprůměrné' : 'Above average';
  if (status === 'high') {
    if (key === 'energyPerM2') return isCs ? 'Vysoká spotřeba energie' : 'High energy consumption';
    if (key === 'energyPerRoomNight') return isCs ? 'Vysoká spotřeba na pokojonoc' : 'High energy use per room-night';
    if (key === 'emissionsPerM2') return isCs ? 'Vysoké emise' : 'High emissions';
    if (key === 'emissionsPerRoomNight') return isCs ? 'Vysoké emise na pokojonoc' : 'High emissions per room-night';
    return isCs ? 'Vysoká spotřeba' : 'High consumption';
  }
  return '-';
};

const getRecommendation = (key: MetricKey, range: Range, value: number | null, isCs: boolean) => {
  if (value === null || Number.isNaN(value)) return '-';

  const upperTypical = range.max ?? range.min;
  const limit = upperTypical * 1.25;

  if (key === 'energyPerM2') {
    if (value <= upperTypical) return isCs ? 'Udržujte současnou úroveň efektivity.' : 'Maintain the current efficiency level.';
    if (value <= limit) return isCs ? 'Zvažte menší provozní úsporná opatření.' : 'Consider small operational energy-saving measures.';
    return isCs ? 'Proveďte energetický audit a zaveďte úsporná opatření.' : 'Conduct an energy audit and implement efficiency improvements.';
  }

  if (key === 'energyPerRoomNight') {
    if (value <= upperTypical) return isCs ? 'Spotřeba je optimální.' : 'Energy use is optimal.';
    if (value <= limit) return isCs ? 'Optimalizujte vytápění, osvětlení a provoz zařízení.' : 'Optimize heating, lighting, and equipment operation.';
    return isCs ? 'Projděte spotřebu na úrovni pokojů a zlepšete regulaci.' : 'Review room-level energy consumption and improve controls.';
  }

  if (key === 'emissionsPerM2') {
    if (value <= upperTypical) return isCs ? 'Emise jsou v očekávaných limitech.' : 'Emissions are within expected limits.';
    if (value <= limit) return isCs ? 'Zvažte částečný přechod na obnovitelné zdroje.' : 'Consider partial transition to renewable sources.';
    return isCs ? 'Snižte využití fosilních paliv a přejděte na nízkouhlíkové technologie.' : 'Reduce fossil fuel use and upgrade to low-carbon technologies.';
  }

  if (key === 'emissionsPerRoomNight') {
    if (value <= upperTypical) return isCs ? 'Emise jsou dobře kontrolované.' : 'Emissions are well controlled.';
    if (value <= limit) return isCs ? 'Zvažte obnovitelnou elektřinu nebo kompenzace.' : 'Consider renewable electricity or carbon offsetting.';
    return isCs ? 'Vytvořte plán snižování emisí a zlepšete energetickou efektivitu.' : 'Develop a carbon-reduction plan and improve energy efficiency.';
  }

  return energyBenchmarks.recommendations[key];
};

export default function EnergyManagementTable({
  totalEnergyKwh,
  totalEmissionsKg,
  floorAreaM2,
  roomNights,
  profileId,
  periodTitle,
}: EnergyManagementTableProps) {
  const { i18n } = useTranslation();
  const isCs = i18n.language === 'cs';
  const energyPerM2 =
    totalEnergyKwh !== null && floorAreaM2 ? totalEnergyKwh / floorAreaM2 : null;
  const energyPerRoomNight =
    totalEnergyKwh !== null && roomNights ? totalEnergyKwh / roomNights : null;
  const emissionsPerM2 =
    totalEmissionsKg !== null && floorAreaM2 ? totalEmissionsKg / floorAreaM2 : null;
  const emissionsPerRoomNight =
    totalEmissionsKg !== null && roomNights ? totalEmissionsKg / roomNights : null;

  const values: Record<MetricKey, number | null> = {
    energyPerM2,
    energyPerRoomNight,
    emissionsPerM2,
    emissionsPerRoomNight,
  };

  const categoryIndex = Math.max(
    0,
    Math.min(energyBenchmarks.categoriesEn.length - 1, Number.parseInt(profileId, 10) - 1 || 0)
  );

  return (
    <div className="space-y-4">
      {periodTitle ? (
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-stone-900">{periodTitle}</h3>
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left border-separate border-spacing-0">
          <thead className="text-xs text-stone-500 uppercase bg-stone-50">
            <tr>
              <th className="px-4 py-3 rounded-tl-2xl">{isCs ? 'Metrika' : 'Metric'}</th>
              <th className="px-4 py-3">{isCs ? 'Hodnota kategorie' : 'Category Value'}</th>
              <th className="px-4 py-3">{isCs ? 'Výsledek' : 'Results'}</th>
              <th className="px-4 py-3 rounded-tr-2xl">{isCs ? 'Doporučení' : 'Recommendation'}</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {energyBenchmarks.metrics.map((metric) => {
              const range = metric.ranges[categoryIndex] as Range | undefined;
              const value = values[metric.key];
              const statusKey = range ? evaluateStatus(value, range, metric.key) : 'unknown';
              const statusText = getStatusText(statusKey, metric.key, isCs);
              const statusClass = getStatusClass(statusKey);
              const rowClass = statusKey === 'lowEmissions' || statusKey === 'within'
                ? 'bg-emerald-50/60'
                : statusKey === 'slightly' || statusKey === 'aboveAverage'
                  ? 'bg-amber-50/60'
                  : statusKey === 'high'
                    ? 'bg-red-50/60'
                    : '';
              const rowTextClass = statusKey === 'lowEmissions' || statusKey === 'within'
                ? 'text-emerald-800'
                : statusKey === 'slightly' || statusKey === 'aboveAverage'
                  ? 'text-amber-800'
                  : statusKey === 'high'
                    ? 'text-red-800'
                    : 'text-stone-800';
              const recommendation = range ? getRecommendation(metric.key, range, value, isCs) : '-';

              return (
                <tr key={metric.key} className={`border-b border-stone-100 last:border-0 ${rowClass}`}>
                  <td className="px-4 py-3">
                    <div className={`font-semibold ${rowTextClass}`}>
                      {isCs ? metric.labelCs : metric.labelEn}
                    </div>
                  </td>
                  <td className={`px-4 py-3 ${rowTextClass}`}>{range ? range.label : '-'}</td>
                  <td className="px-4 py-3">
                    <div className={`font-semibold ${rowTextClass}`}>{formatValue(value)}</div>
                    <div className={`text-xs font-semibold ${statusClass}`}>{statusText}</div>
                  </td>
                  <td className={`px-4 py-3 ${rowTextClass}`}>{recommendation}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
