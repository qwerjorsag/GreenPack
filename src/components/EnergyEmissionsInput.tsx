import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface EnergySource {
  id: string;
  nameEn: string;
  nameCs: string;
  ef: number;
  explanationEn: string;
  explanationCs: string;
}

const ENERGY_SOURCES: EnergySource[] = [
  {
    id: 'electricity_grid',
    nameEn: 'Electricity – grid',
    nameCs: 'Elektřina – síť',
    ef: 0.432,
    explanationEn: 'Electricity purchased from the national grid (without renewable certificates).',
    explanationCs: 'Elektřina nakoupená z národní sítě (bez certifikátů původu).',
  },
  {
    id: 'electricity_renewable',
    nameEn: 'Electricity – renewable',
    nameCs: 'Elektřina – obnovitelná',
    ef: 0,
    explanationEn: 'Electricity supplied with Guarantees of Origin or Renewable Energy Certificates – may be reported as zero-emission (market-based).',
    explanationCs: 'Elektřina dodávaná se zárukami původu – může být vykazována jako bezemisní.',
  },
  {
    id: 'natural_gas',
    nameEn: 'Natural gas',
    nameCs: 'Zemní plyn',
    ef: 0.202,
    explanationEn: 'Fuel gas used for heating or water heating.',
    explanationCs: 'Plyn používaný k vytápění nebo ohřevu vody.',
  },
  {
    id: 'heating_oil',
    nameEn: 'Heating oil',
    nameCs: 'Topný olej',
    ef: 0.267,
    explanationEn: 'Diesel or light fuel oil used in boilers.',
    explanationCs: 'Nafta nebo lehký topný olej používaný v kotlích.',
  },
  {
    id: 'lpg',
    nameEn: 'LPG',
    nameCs: 'LPG',
    ef: 0.227,
    explanationEn: 'Liquefied petroleum gas used for heating or cooking.',
    explanationCs: 'Zkapalněný ropný plyn používaný k vytápění nebo vaření.',
  },
  {
    id: 'biomass',
    nameEn: 'Biomass (biogenic)',
    nameCs: 'Biomasa (biogenní)',
    ef: 0.02,
    explanationEn: 'Wood pellets, chips, or similar – only biogenic fraction counted.',
    explanationCs: 'Dřevní pelety, štěpka apod. – započítává se pouze biogenní frakce.',
  },
  {
    id: 'district_heating',
    nameEn: 'District heating',
    nameCs: 'Dálkové vytápění',
    ef: 0.18,
    explanationEn: 'Purchased heat from a district system; factor depends on local mix.',
    explanationCs: 'Teplo nakoupené ze systému dálkového vytápění; faktor závisí na lokálním mixu.',
  },
  {
    id: 'other',
    nameEn: 'Other',
    nameCs: 'Jiné',
    ef: 0.2,
    explanationEn: 'Any other energy source not listed above.',
    explanationCs: 'Jakýkoli jiný zdroj energie neuvedený výše.',
  }
];

interface Props {
  themeColor?: 'emerald' | 'blue' | 'orange' | 'amber' | 'yellow' | 'stone';
}

export default function EnergyEmissionsInput({ themeColor = 'yellow' }: Props) {
  const { i18n } = useTranslation();
  const isCs = i18n.language === 'cs';

  const [values, setValues] = useState<Record<string, number | ''>>({});

  const handleValueChange = (id: string, val: string) => {
    if (val === '') {
      setValues(prev => ({ ...prev, [id]: '' }));
      return;
    }
    const num = Math.round(parseFloat(val));
    if (!isNaN(num)) {
      setValues(prev => ({ ...prev, [id]: num < 0 ? 0 : num }));
    }
  };

  const calculateEmissions = (kwh: number | '', ef: number) => {
    if (kwh === '' || isNaN(kwh)) return 0;
    return (kwh * ef) / 1000;
  };

  const totalKwh = ENERGY_SOURCES.reduce((sum, source) => {
    const val = values[source.id];
    return sum + (typeof val === 'number' ? val : 0);
  }, 0);

  const totalEmissions = ENERGY_SOURCES.reduce((sum, source) => {
    const val = values[source.id];
    return sum + calculateEmissions(val, source.ef);
  }, 0);

  const themeClasses = {
    emerald: 'bg-emerald-50 border-emerald-200 focus:ring-emerald-500/20',
    blue: 'bg-blue-50 border-blue-200 focus:ring-blue-500/20',
    orange: 'bg-orange-50 border-orange-200 focus:ring-orange-500/20',
    amber: 'bg-amber-50 border-amber-200 focus:ring-amber-500/20',
    stone: 'bg-stone-50 border-stone-200 focus:ring-stone-500/20',
    yellow: 'bg-yellow-50 border-yellow-200 focus:ring-yellow-500/20',
  };

  const inputClass = themeClasses[themeColor];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-stone-900">
          {isCs ? 'ENERGIE A EMISE – EU faktory' : 'ENERGY & EMISSIONS – EU factors'}
        </h3>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="border border-amber-200 rounded-2xl overflow-hidden bg-white">
          <table className="w-full text-sm text-left border-separate border-spacing-0">
            <thead className="text-xs text-stone-900 font-bold bg-amber-50">
              <tr>
                <th className="px-4 py-2 border-b border-amber-200 text-center">{isCs ? 'Zdroj energie' : 'Energy source'}</th>
                <th className="px-3 py-2 border-b border-amber-200 text-center w-24">kWh</th>
                <th className="px-4 py-2 border-b border-amber-200 text-center">EF (kg CO₂e/kWh)</th>
                <th className="px-4 py-2 border-b border-amber-200 text-center">Emissions (t CO₂e)</th>
                <th className="px-4 py-2 border-b border-amber-200 bg-amber-100 text-center">{isCs ? 'Vysvětlení' : 'Explanation'}</th>
              </tr>
            </thead>
            <tbody>
              {ENERGY_SOURCES.map((source) => {
                const val = values[source.id];
                const emissions = calculateEmissions(val, source.ef);
                
                return (
                  <tr key={source.id} className="border-b border-amber-200 hover:bg-amber-50/60 transition-colors">
                    <td className="px-4 py-2 border-b border-amber-200 font-medium text-stone-800 bg-amber-50/60">
                      {isCs ? source.nameCs : source.nameEn}
                    </td>
                    <td className="px-2 py-1 border-b border-amber-200 bg-white w-24">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={val === undefined ? '' : val}
                        onChange={(e) => handleValueChange(source.id, e.target.value)}
                        className={`w-full p-1.5 text-right border rounded focus:outline-none focus:ring-2 transition-all ${inputClass}`}
                        placeholder="0"
                      />
                    </td>
                    <td className="px-4 py-2 border-b border-amber-200 font-bold text-center bg-amber-50">
                      {source.ef.toString().replace('.', ',')}
                    </td>
                    <td className="px-4 py-2 border-b border-amber-200 font-mono text-right bg-amber-100/60">
                      {emissions.toFixed(2).replace('.', ',')}
                    </td>
                    <td className="px-4 py-2 border-b border-amber-200 text-xs text-stone-700 bg-amber-100">
                      {isCs ? source.explanationCs : source.explanationEn}
                    </td>
                  </tr>
                );
              })}
              <tr className="font-bold bg-amber-200/70 text-stone-900 border-t border-amber-300">
                <td className="px-4 py-3 border-t border-amber-300 uppercase">TOTAL</td>
                <td className="px-4 py-3 border-t border-amber-300 font-mono text-right">
                  {totalKwh.toLocaleString('cs-CZ', { maximumFractionDigits: 0 })}
                </td>
                <td className="px-4 py-3 border-t border-amber-300 bg-amber-50"></td>
                <td className="px-4 py-3 border-t border-amber-300 font-mono text-right">
                  {totalEmissions.toFixed(2).replace('.', ',')}
                </td>
                <td className="px-4 py-3 border-t border-amber-300 bg-white"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
