import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import ratingMatrixEn from '../../data/ratingMatrix.en.json';
import ratingMatrixCs from '../../data/ratingMatrix.cs.json';

type Thresholds = {
  goodMax: number;
  acceptableMax: number;
  upperRef: number;
};

type Direction = 'lowerIsBetter' | 'higherIsBetter';

export type IndicatorKey =
  | 'energyIntensityM2'
  | 'energyIntensityRoomNight'
  | 'emissionsIntensityM2'
  | 'emissionsIntensityRoomNight'
  | 'renewableShare';

export type IndicatorRow = {
  key: IndicatorKey;
  labelEn: string;
  labelCs: string;
  unit: string;
  thresholds: Thresholds;
  weight: number;
  direction: Direction;
};

type InputsState = Record<IndicatorKey, Array<number | null>>;

interface Props {
  years: number[];
  valuesByYear: InputsState;
}

export const BENCHMARK_INDICATORS: IndicatorRow[] = [
  {
    key: 'energyIntensityM2',
    labelEn: 'Energy intensity (kWh/m²)',
    labelCs: 'Intenzita energie (kWh/m²)',
    unit: 'kWh/m²',
    thresholds: { goodMax: 90, acceptableMax: 120, upperRef: 200 },
    weight: 0.25,
    direction: 'lowerIsBetter',
  },
  {
    key: 'energyIntensityRoomNight',
    labelEn: 'Energy intensity (kWh/RN)',
    labelCs: 'Intenzita energie (kWh/pokojonoc)',
    unit: 'kWh/RN',
    thresholds: { goodMax: 35, acceptableMax: 45, upperRef: 60 },
    weight: 0.0,
    direction: 'lowerIsBetter',
  },
  {
    key: 'emissionsIntensityM2',
    labelEn: 'Emissions intensity (kg CO₂e/m²)',
    labelCs: 'Intenzita emisí (kg CO₂e/m²)',
    unit: 'kg CO₂e/m²',
    thresholds: { goodMax: 15, acceptableMax: 25, upperRef: 50 },
    weight: 0.25,
    direction: 'lowerIsBetter',
  },
  {
    key: 'emissionsIntensityRoomNight',
    labelEn: 'Emissions intensity (kg CO₂e/RN)',
    labelCs: 'Intenzita emisí (kg CO₂e/pokojonoc)',
    unit: 'kg CO₂e/RN',
    thresholds: { goodMax: 5, acceptableMax: 12, upperRef: 20 },
    weight: 0.0,
    direction: 'lowerIsBetter',
  },
  {
    key: 'renewableShare',
    labelEn: 'Renewable electricity share',
    labelCs: 'Podíl obnovitelné elektřiny',
    unit: '%',
    thresholds: { goodMax: 80, acceptableMax: 60, upperRef: 10 },
    weight: 0.15,
    direction: 'higherIsBetter',
  },
];

const scoreLowerIsBetter = (value: number | null | undefined, t: Thresholds): number | null => {
  if (value === null || value === undefined || Number.isNaN(value)) return null;

  const L = t.goodMax;
  const M = t.acceptableMax;
  const N = t.upperRef;

  const LM = M - L;
  const MN = N - M;

  if (value <= L) return 100;
  if (value <= M) {
    if (LM === 0) return 80;
    return 100 - (value - L) * (20 / LM);
  }
  if (value <= N) {
    if (MN === 0) return 40;
    return 80 - (value - M) * (40 / MN);
  }
  return 20;
};

const scoreHigherIsBetter = (value: number | null | undefined, t: Thresholds): number | null => {
  if (value === null || value === undefined || Number.isNaN(value)) return null;

  const L = t.goodMax;
  const M = t.acceptableMax;
  const N = t.upperRef;

  const ML = L - M;
  const NM = M - N;

  if (value >= L) return 100;
  if (value >= M) {
    if (ML === 0) return 100;
    return 80 + (value - M) * (20 / ML);
  }
  if (value >= N) {
    if (NM === 0) return 80;
    return 40 + (value - N) * (40 / NM);
  }
  return 20;
};

const scoreForYear = (value: number | null, row: IndicatorRow) => {
  return row.direction === 'higherIsBetter'
    ? scoreHigherIsBetter(value, row.thresholds)
    : scoreLowerIsBetter(value, row.thresholds);
};

const weightedScore = (score: number | null, weight: number) => (score === null ? null : score * weight);

const fmt = (value: number | null, digits = 2) => {
  if (value === null) return '—';
  return value.toFixed(digits).replace('.', ',');
};

export default function BenchmarksThresholdsTable({ years, valuesByYear }: Props) {
  const { i18n } = useTranslation();
  const isCs = i18n.language === 'cs';
  const title = isCs ? 'BENCHMARKY A PRAHY' : 'BENCHMARKS & THRESHOLDS';
  const ratingMatrix = isCs ? ratingMatrixCs.ratingMatrix : ratingMatrixEn.ratingMatrix;

  const getBand = (score: number | null) => {
    if (score === null || Number.isNaN(score)) return null;
    return (
      Object.values(ratingMatrix.bands).find((b) => score >= b.min && score <= b.max) || null
    );
  };

  const cleanLabel = (label: string) => label.replace(/\s*\(.*\)\s*/g, '');

  const totals = useMemo(() => {
    const perYear = years.map((_, idx) => {
      let sumWeighted = 0;
      let hasAny = false;
      for (const row of BENCHMARK_INDICATORS) {
        const s = scoreForYear(valuesByYear[row.key]?.[idx] ?? null, row);
        const w = weightedScore(s, row.weight);
        if (w !== null) {
          sumWeighted += w;
          hasAny = true;
        }
      }
      return hasAny ? sumWeighted : null;
    });
    return { perYear };
  }, [valuesByYear, years]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3>{title}</h3>
      </div>
      <div className="gp-table-wrap">
        <table className="gp-table">
          <thead className="gp-table-head">
            <tr>
              <th className="gp-th gp-th-left">{isCs ? 'Ukazatel' : 'Indicator'}</th>
              {years.map((year) => (
                <th key={year} className="gp-th gp-th-center">{year}</th>
              ))}
              <th className="gp-th gp-th-center">{isCs ? 'Skóre pro rok X' : 'Score for year X'}</th>
              <th className="gp-th gp-th-center">{isCs ? 'Váha' : 'Weight'}</th>
              <th className="gp-th gp-th-center">{isCs ? 'Vážené skóre' : 'Weighted score'}</th>
              <th className="gp-th gp-th-center gp-th-right"></th>
            </tr>
          </thead>
          <tbody>
            {BENCHMARK_INDICATORS.map((row) => {
              const scoreX = scoreForYear(valuesByYear[row.key]?.[0] ?? null, row);
              const wScoreX = weightedScore(scoreX, row.weight);
              return (
                <tr key={row.key} className="gp-row">
                  <td className="gp-td font-medium">{isCs ? row.labelCs : row.labelEn}</td>
                  {years.map((_, idx) => (
                    <td key={`${row.key}-${idx}`} className="gp-td gp-td-center">
                      {fmt(valuesByYear[row.key]?.[idx] ?? null, 2)}
                    </td>
                  ))}
                  <td className="gp-td gp-td-center">{fmt(scoreX, 2)}</td>
                  <td className="gp-td gp-td-center">{row.weight}</td>
                  <td className="gp-td gp-td-center">{fmt(wScoreX, 2)}</td>
                  <td className="gp-td gp-td-center"></td>
                </tr>
              );
            })}
            <tr className="font-bold bg-stone-100 text-stone-900">
              <td className="gp-td uppercase">
                {isCs ? 'Celkové vážené skóre' : 'Total weighted score'}
              </td>
              {years.map((_, idx) => (
                <td key={`total-${idx}`} className="gp-td gp-td-center">
                  {fmt(totals.perYear[idx] ?? null, 2)}
                </td>
              ))}
              <td className="gp-td gp-td-center"></td>
              <td className="gp-td gp-td-center"></td>
              <td className="gp-td gp-td-center"></td>
              <td className="gp-td gp-td-center"></td>
            </tr>
            <tr className="bg-stone-50 text-stone-700">
              <td className="gp-td uppercase">{ratingMatrix.headers.rating}</td>
              {years.map((_, idx) => {
                const band = getBand(totals.perYear[idx] ?? null);
                return (
                  <td key={`tier-${idx}`} className="gp-td gp-td-center">
                    {band ? cleanLabel(band.label) : '—'}
                  </td>
                );
              })}
              <td className="gp-td gp-td-center"></td>
              <td className="gp-td gp-td-center"></td>
              <td className="gp-td gp-td-center"></td>
              <td className="gp-td gp-td-center"></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="grid gap-4 text-sm text-stone-700">
        {years.map((year, idx) => {
          const band = getBand(totals.perYear[idx] ?? null);
          return (
            <div key={`desc-${year}`} className="rounded-2xl border border-stone-200 bg-white p-4">
              <div className="text-sm font-bold text-stone-900">{isCs ? 'Rok' : 'Year'} {year}</div>
              <div className="mt-2 text-stone-700">
                <span className="font-semibold">{ratingMatrix.headers.rating}:</span>{' '}
                {band ? cleanLabel(band.label) : '—'}
              </div>
              <div className="mt-2 text-stone-700">
                <span className="font-semibold">{ratingMatrix.headers.meaning}:</span>{' '}
                {band ? band.meaning : '—'}
              </div>
              <div className="mt-2 text-stone-700">
                <span className="font-semibold">{ratingMatrix.headers.typicalProfile}:</span>{' '}
                {band ? band.typicalProfile : '—'}
              </div>
              <div className="mt-2 text-stone-700">
                <span className="font-semibold">{ratingMatrix.headers.recommendedNextSteps}:</span>{' '}
                {band ? band.recommendedNextSteps : '—'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
