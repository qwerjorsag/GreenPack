import React from 'react';
import { useTranslation } from 'react-i18next';
import { ENERGY_SOURCES } from '../EnergyEmissionsInput';
import EnergyKwhTable from './EnergyKwhTable';
import EnergyEmissionsTable from './EnergyEmissionsTable';
import EnergyGjTable from './EnergyGjTable';
import UnitSwitch from '../ui/UnitSwitch';

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
  const [showUnitsKwh, setShowUnitsKwh] = React.useState(true);
  const [showUnitsEm, setShowUnitsEm] = React.useState(true);
  const [showUnitsGj, setShowUnitsGj] = React.useState(true);
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

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 768px)');
    const apply = () => {
      const isMobile = mq.matches;
      setShowUnitsKwh(!isMobile);
      setShowUnitsEm(!isMobile);
      setShowUnitsGj(!isMobile);
    };
    apply();
    mq.addEventListener?.('change', apply);
    return () => {
      mq.removeEventListener?.('change', apply);
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3>{isCs ? 'ENERGIE (kWh)' : 'ENERGY (kWh)'}</h3>
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

      <UnitSwitch
        checked={showUnitsKwh}
        onToggle={() => setShowUnitsKwh((v) => !v)}
        label={isCs ? 'Zobrazit jednotky' : 'Show units'}
        color="yellow"
        className="mt-2 mb-16"
        data-pdf-hide
      />

      <div className="flex justify-between items-center">
        <h3>{isCs ? 'EMISE (t CO₂e)' : 'EMISSIONS (t CO₂e)'}</h3>
      </div>

      <EnergyEmissionsTable
        isCs={isCs}
        periods={periodsSlice}
        values={values}
        showUnits={showUnitsEm}
        totals={emissionTotals}
        formatEmissions={formatEmissions}
      />

      <UnitSwitch
        checked={showUnitsEm}
        onToggle={() => setShowUnitsEm((v) => !v)}
        label={isCs ? 'Zobrazit jednotky' : 'Show units'}
        color="yellow"
        className="mt-2 mb-16"
        data-pdf-hide
      />

      <div className="flex justify-between items-center">
        <h3>{isCs ? 'ENERGIE (GJ)' : 'ENERGY (GJ)'}</h3>
      </div>

      <EnergyGjTable
        isCs={isCs}
        periods={periodsSlice}
        values={values}
        showUnits={showUnitsGj}
        totals={totalsGj}
        formatGj={formatGj}
      />

      <UnitSwitch
        checked={showUnitsGj}
        onToggle={() => setShowUnitsGj((v) => !v)}
        label={isCs ? 'Zobrazit jednotky' : 'Show units'}
        color="yellow"
        className="mt-2 mb-16"
        data-pdf-hide
      />
    </div>
  );
}
