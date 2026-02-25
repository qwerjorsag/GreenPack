import React from 'react';
import { useTranslation } from 'react-i18next';
import { ENERGY_SOURCES } from './EnergyEmissionsInput';
import InfoTooltip from './InfoTooltip';

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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-stone-900">
          {isCs ? 'ENERGIE (kWh)' : 'ENERGY (kWh)'}
        </h3>
      </div>

      <div className="overflow-x-auto overflow-y-visible pb-4">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-stone-500 uppercase bg-stone-50">
            <tr>
              <th className="pl-4 pr-1 py-3 rounded-tl-xl whitespace-normal break-words max-w-[140px] md:max-w-none">
                {isCs ? 'Zdroj energie' : 'Energy source'}
              </th>
              <th className="px-0.5 py-3 w-6 text-center hidden md:table-cell"></th>
              {periodsSlice.map((p, idx) => (
                <th
                  key={`period-${idx}`}
                  className={`px-3 py-3 text-center whitespace-normal break-words ${idx === 2 ? 'rounded-tr-xl' : ''}`}
                >
                  {p.period || (isCs ? `Období ${idx + 1}` : `Period ${idx + 1}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ENERGY_SOURCES.map((source) => (
              <tr key={source.id} className="border-b border-stone-100 last:border-0">
                <td className="pl-4 pr-1 py-3">
                  <span className="text-sm font-medium text-stone-800">
                    {isCs ? source.nameCs : source.nameEn}
                  </span>
                </td>
                <td className="px-0.5 py-3 w-6 text-xs text-stone-700 hidden md:table-cell">
                  <div className="flex justify-center">
                    <InfoTooltip
                      label={isCs ? 'Vysvětlení' : 'Explanation'}
                      content={isCs ? source.explanationCs : source.explanationEn}
                    />
                  </div>
                </td>
                {periodsSlice.map((_, idx) => {
                  const val = values[idx]?.[source.id] ?? '';
                  return (
                    <td key={`${source.id}-${idx}`} className="px-3 py-3">
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="numeric"
                          min="0"
                          step="1"
                          value={typeof val === 'number' ? formatWithSpaces(val) : ''}
                          onChange={(e) => {
                            const raw = e.target.value.replace(/\s/g, '');
                            handleChange(idx, source.id, raw);
                          }}
                          className="w-full p-1.5 pr-10 text-right border rounded-lg bg-stone-50 border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-200 transition-all"
                          placeholder="0"
                        />
                        {showUnitsKwh && (
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 text-[10px] font-medium pointer-events-none">
                            kWh
                          </span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr className="font-bold bg-stone-100 text-stone-900">
              <td className="pl-4 pr-1 py-3 uppercase rounded-bl-xl">
                {isCs ? 'Celkem' : 'Total'}
              </td>
              <td className="px-0.5 py-3 w-6"></td>
              {totals.map((total, idx) => (
                <td
                  key={`total-${idx}`}
                  className={`px-3 py-3 text-right ${idx === totals.length - 1 ? 'rounded-br-xl' : ''}`}
                >
                  {formatWithSpaces(total)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

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

      <div className="overflow-x-auto overflow-y-visible pb-4">
        <table className="w-full text-sm text-left tabular-nums table-fixed">
          <thead className="text-xs text-stone-500 uppercase bg-stone-50">
            <tr>
              <th className="pl-4 pr-1 py-3 rounded-tl-xl whitespace-normal break-words max-w-[140px] md:max-w-none w-1/3">
                {isCs ? 'Zdroj energie' : 'Energy source'}
              </th>
              {periodsSlice.map((p, idx) => (
                <th
                  key={`emission-period-${idx}`}
                  className={`px-3 py-3 text-center whitespace-normal break-words w-1/3 ${idx === 2 ? 'rounded-tr-xl' : ''}`}
                >
                  {p.period || (isCs ? `Období ${idx + 1}` : `Period ${idx + 1}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ENERGY_SOURCES.map((source) => (
              <tr key={`${source.id}-em`} className="border-b border-stone-100 last:border-0">
                <td className="pl-4 pr-1 py-3">
                  <span className="text-sm font-medium text-stone-800">
                    {isCs ? source.nameCs : source.nameEn}
                  </span>
                </td>
                {periodsSlice.map((_, idx) => {
                  const val = values[idx]?.[source.id];
                  const kwh = typeof val === 'number' ? val : 0;
                  const emissions = (kwh * source.ef) / 1000;
                  return (
                    <td key={`${source.id}-em-${idx}`} className="px-3 py-3 text-center w-1/3">
                      <span className="whitespace-nowrap">
                        {formatEmissions(emissions)}
                        {showUnitsEm && <span className="text-xs text-stone-500"> t CO₂e</span>}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr className="font-bold bg-stone-100 text-stone-900">
              <td className="pl-4 pr-1 py-3 uppercase rounded-bl-xl">
                {isCs ? 'Celkem' : 'Total'}
              </td>
              {emissionTotals.map((total, idx) => (
                <td
                  key={`em-total-${idx}`}
                  className={`px-3 py-3 text-center w-1/3 ${idx === emissionTotals.length - 1 ? 'rounded-br-xl' : ''}`}
                >
                  <span className="whitespace-nowrap">
                    {formatEmissions(total)}
                    {showUnitsEm && <span className="text-xs text-stone-500"> t CO₂e</span>}
                  </span>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

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

      <div className="overflow-x-auto overflow-y-visible pb-4">
        <table className="w-full text-sm text-left tabular-nums table-fixed">
          <thead className="text-xs text-stone-500 uppercase bg-stone-50">
            <tr>
              <th className="pl-4 pr-1 py-3 rounded-tl-xl whitespace-normal break-words max-w-[140px] md:max-w-none w-1/3">
                {isCs ? 'Zdroj energie' : 'Energy source'}
              </th>
              {periodsSlice.map((p, idx) => (
                <th
                  key={`gj-period-${idx}`}
                  className={`px-3 py-3 text-center whitespace-normal break-words w-1/3 ${idx === 2 ? 'rounded-tr-xl' : ''}`}
                >
                  {p.period || (isCs ? `Období ${idx + 1}` : `Period ${idx + 1}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ENERGY_SOURCES.map((source) => (
              <tr key={`${source.id}-gj`} className="border-b border-stone-100 last:border-0">
                <td className="pl-4 pr-1 py-3">
                  <span className="text-sm font-medium text-stone-800">
                    {isCs ? source.nameCs : source.nameEn}
                  </span>
                </td>
                {periodsSlice.map((_, idx) => {
                  const val = values[idx]?.[source.id];
                  const kwh = typeof val === 'number' ? val : 0;
                  const gj = kwh * 0.0036;
                  return (
                    <td key={`${source.id}-gj-${idx}`} className="px-3 py-3 text-center w-1/3">
                      <span className="whitespace-nowrap">
                        {formatGj(gj)}
                        {showUnitsGj && <span className="text-xs text-stone-500"> GJ</span>}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr className="font-bold bg-stone-100 text-stone-900">
              <td className="pl-4 pr-1 py-3 uppercase rounded-bl-xl">
                {isCs ? 'Celkem' : 'Total'}
              </td>
              {totalsGj.map((total, idx) => (
                <td
                  key={`gj-total-${idx}`}
                  className={`px-3 py-3 text-center w-1/3 ${idx === totalsGj.length - 1 ? 'rounded-br-xl' : ''}`}
                >
                  <span className="whitespace-nowrap">
                    {formatGj(total)}
                    {showUnitsGj && <span className="text-xs text-stone-500"> GJ</span>}
                  </span>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

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
