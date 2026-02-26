import type { MetricKey } from '../data/energyBenchmarks';
import { energyBenchmarks } from '../data/energyBenchmarks';

export const evaluateStatus = (
  value: number | null,
  range: { min: number; max: number | null },
  key: MetricKey
) => {
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

export const getStatusText = (status: string, key: MetricKey, isCs: boolean) => {
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

export const getRecommendation = (
  key: MetricKey,
  range: { min: number; max: number | null },
  value: number | null,
  isCs: boolean
) => {
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
