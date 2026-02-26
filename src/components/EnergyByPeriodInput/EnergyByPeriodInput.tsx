import React from 'react';
import { useTranslation } from 'react-i18next';
import { ENERGY_SOURCES } from '../EnergyEmissionsInput';
import EnergyKwhTable from './EnergyKwhTable';
import EnergyEmissionsTable from './EnergyEmissionsTable';
import EnergyGjTable from './EnergyGjTable';

type EnergyByPeriod = Record<string, number | ''>;

interface Props {
  periods: { period: string }[];
  values: EnergyByPeriod[];
  onChange: (values: EnergyByPeriod[]) => void;
}

const formatWithSpaces = (value: number) => {
  return value.toLocaleString('cs-CZ').replace(/\u00A0/g, ' ');
};

const formatEmissions = (value: number) => {
  return value.toLocaleString('cs-CZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/\u00A0/g, ' ');
};

export default function EnergyByPeriodInput({ periods, values, onChange }: Props) {
  const { i18n } = useTranslation();
  const isCs = i18n.language === 'cs';
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;
  const [showUnitsKwh, setShowUnitsKwh] = React.useState(!isMobile);
  const [showUnitsEm, setShowUnitsEm] = React.useState(!isMobile);
  const [showUnitsGj, setShowUnitsGj] = React.useState(!isMobile);
  const periodsSlice = periods.slice(0, 3);

  const totals = periodsSlice.map((_, idx) =>
    ENERGY_SOURCES.reduce((sum, source) => {
      const val = values[idx]?.[source.id];
      return sum + (typeof val === 'number' ? val : 0);
    }, 0)
  );

  const totalsGj = totals.map((total) => total * 0.0036);

  const emissionTotals = periodsSlice.map((_, idx) =>
    ENERGY_SOURCES.reduce((sum, source) => {
      const val = values[idx]?.[source.id];
      const kwh = typeof val === 'number' ? val : 0;
      return sum + (kwh * source.ef) / 1000;
    }, 0)
  );

  const formatGj = (value: number) => {
    return value
      .toLocaleString('cs-CZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      .replace(/\u00A0/g, ' ');
  };

  const handleChange = (periodIndex: number, sourceId: string, raw: string) => {
    const next = values.map((v) => ({ ...v }));
    if (raw === '') {
      next[periodIndex][sourceId] = '';
    } else {
      const num = Math.round(parseFloat(raw));
      next[periodIndex][sourceId] = Number.isNaN(num) ? '' : Math.max(0, num);
    }
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-stone-900">
          {isCs ? 'ENERGIE (kWh)' : 'ENERGY (kWh)'}
        </h3>
      </div>

      <EnergyKwhTable
        isCs={isCs}
        periods={periodsSlice}
        values={values}
        showUnits={showUnitsKwh}
        totals={totals}
        onChange={handleChange}
        formatWithSpaces={formatWithSpaces}
      />

      <div className="flex items-center gap-3 text-sm text-stone-700" data-pdf-hide>
        <button
          type="button"
          onClick={() => setShowUnitsKwh((v) => !v)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showUnitsKwh ? 'bg-yellow-500' : 'bg-stone-300'}`}
          aria-pressed={showUnitsKwh}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${showUnitsKwh ? 'translate-x-5' : 'translate-x-1'}`}
          />
        </button>
        <span>{isCs ? 'Zobrazit jednotky' : 'Show units'}</span>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-stone-900">
          {isCs ? 'EMISE (t CO₂e)' : 'EMISSIONS (t CO₂e)'}
        </h3>
      </div>

      <EnergyEmissionsTable
        isCs={isCs}
        periods={periodsSlice}
        values={values}
        showUnits={showUnitsEm}
        totals={emissionTotals}
        formatEmissions={formatEmissions}
      />

      <div className="flex items-center gap-3 text-sm text-stone-700" data-pdf-hide>
        <button
          type="button"
          onClick={() => setShowUnitsEm((v) => !v)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showUnitsEm ? 'bg-yellow-500' : 'bg-stone-300'}`}
          aria-pressed={showUnitsEm}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${showUnitsEm ? 'translate-x-5' : 'translate-x-1'}`}
          />
        </button>
        <span>{isCs ? 'Zobrazit jednotky' : 'Show units'}</span>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-stone-900">
          {isCs ? 'ENERGIE (GJ)' : 'ENERGY (GJ)'}
        </h3>
      </div>

      <EnergyGjTable
        isCs={isCs}
        periods={periodsSlice}
        values={values}
        showUnits={showUnitsGj}
        totals={totalsGj}
        formatGj={formatGj}
      />

      <div className="flex items-center gap-3 text-sm text-stone-700" data-pdf-hide>
        <button
          type="button"
          onClick={() => setShowUnitsGj((v) => !v)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showUnitsGj ? 'bg-yellow-500' : 'bg-stone-300'}`}
          aria-pressed={showUnitsGj}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${showUnitsGj ? 'translate-x-5' : 'translate-x-1'}`}
          />
        </button>
        <span>{isCs ? 'Zobrazit jednotky' : 'Show units'}</span>
      </div>
    </div>
  );
}
