import React from 'react';
import { useTranslation } from 'react-i18next';
import InfoTooltip from '../InfoTooltip';
import DataTable from '../DataTable';

interface EnergySource {
  id: string;
  nameEn: string;
  nameCs: string;
  ef: number;
  explanationEn: string;
  explanationCs: string;
}

export const ENERGY_SOURCES: EnergySource[] = [
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
  values: Record<string, number | ''>;
  onValuesChange: (values: Record<string, number | ''>) => void;
  themeColor?: 'emerald' | 'blue' | 'orange' | 'amber' | 'yellow' | 'stone';
}

export default function EnergyEmissionsInput({ values, onValuesChange, themeColor = 'yellow' }: Props) {
  const { i18n } = useTranslation();
  const isCs = i18n.language === 'cs';

  const handleValueChange = (id: string, val: string) => {
    if (val === '') {
      onValuesChange({ ...values, [id]: '' });
      return;
    }
    const num = Math.round(parseFloat(val));
    if (!isNaN(num)) {
      onValuesChange({ ...values, [id]: num < 0 ? 0 : num });
    }
  };

  const calculateEmissions = (kwh: number | '', ef: number) => {
    if (kwh === '' || isNaN(kwh)) return 0;
    return (kwh * ef) / 1000;
  };

  const formatWithSpaces = (value: number) => {
    return value.toLocaleString('cs-CZ').replace(/\u00A0/g, ' ');
  };

  const totalKwh = ENERGY_SOURCES.reduce((sum, source) => {
    const val = values[source.id];
    return sum + (typeof val === 'number' ? val : 0);
  }, 0);

  const totalEmissions = ENERGY_SOURCES.reduce((sum, source) => {
    const val = values[source.id];
    return sum + calculateEmissions(val, source.ef);
  }, 0);

  const inputClass = 'bg-stone-50 border-stone-200 rounded-lg focus:ring-stone-200';

  const rows = [
    ...ENERGY_SOURCES.map((source) => ({ type: 'source' as const, source })),
    { type: 'total' as const },
  ];

  const columns = [
    {
      id: 'energy',
      header: isCs ? 'Zdroj energie' : 'Energy source',
      headerClassName: 'pl-4 pr-1 py-3 rounded-tl-xl whitespace-normal break-words max-w-[120px] md:max-w-none',
      cellClassName: 'pl-4 pr-1 py-3',
      render: (row: typeof rows[number]) => {
        if (row.type === 'total') {
          return <span className="font-bold uppercase text-stone-900">{isCs ? 'Celkem' : 'Total'}</span>;
        }
        return (
          <span className="text-sm font-medium text-stone-800">
            {isCs ? row.source.nameCs : row.source.nameEn}
          </span>
        );
      },
    },
    {
      id: 'tooltip',
      header: '',
      headerClassName: 'px-0.5 py-3 w-6 text-center',
      cellClassName: 'px-0.5 py-3 text-xs text-stone-700 w-6',
      render: (row: typeof rows[number]) => {
        if (row.type === 'total') {
          return (
            <div className="flex justify-center">
              <InfoTooltip
                label={isCs ? 'Celkem' : 'Total'}
                content={isCs ? 'Celková spotřeba energie.' : 'Total energy consumption.'}
              />
            </div>
          );
        }
        const explanation = isCs ? row.source.explanationCs : row.source.explanationEn;
        return (
          <div className="flex justify-center">
            <InfoTooltip label={isCs ? 'Vysvětlení' : 'Explanation'} content={explanation} />
          </div>
        );
      },
    },
    {
      id: 'kwh',
      header: 'kWh',
      headerClassName: 'px-3 py-3 w-24 text-center whitespace-normal break-words',
      cellClassName: 'px-2 py-3 w-24',
      align: 'right' as const,
      render: (row: typeof rows[number]) => {
        if (row.type === 'total') {
          return <span className="font-bold text-stone-900">{formatWithSpaces(totalKwh)}</span>;
        }
        const val = values[row.source.id];
        return (
          <input
            type="text"
            inputMode="numeric"
            min="0"
            step="1"
            value={typeof val === 'number' ? formatWithSpaces(val) : ''}
            onChange={(e) => {
              const raw = e.target.value.replace(/\s/g, '');
              handleValueChange(row.source.id, raw);
            }}
            className={`w-full p-1.5 text-right border rounded-lg focus:outline-none focus:ring-2 transition-all ${inputClass}`}
            placeholder="0"
          />
        );
      },
    },
    {
      id: 'ef',
      header: 'EF (kg CO₂e/kWh)',
      headerClassName: 'px-4 py-3 text-center hidden md:table-cell whitespace-normal break-words',
      cellClassName: 'px-4 py-3 text-center hidden md:table-cell',
      align: 'center' as const,
      render: (row: typeof rows[number]) => {
        if (row.type === 'total') return '';
        return row.source.ef.toString().replace('.', ',');
      },
    },
    {
      id: 'emissions',
      header: isCs ? 'Emise (t CO₂e)' : 'Emissions (t CO₂e)',
      headerClassName: 'px-4 py-3 text-center whitespace-normal break-words max-w-[120px] md:max-w-none',
      cellClassName: 'px-4 py-3 text-right',
      render: (row: typeof rows[number]) => {
        if (row.type === 'total') {
          return <span className="font-bold text-stone-900">{totalEmissions.toFixed(2).replace('.', ',')}</span>;
        }
        const val = values[row.source.id];
        const emissions = calculateEmissions(val, row.source.ef);
        return <span className="font-bold">{emissions.toFixed(2).replace('.', ',')}</span>;
      },
    },
    {
      id: 'corner',
      header: '',
      headerClassName: 'px-4 py-3 rounded-tr-xl text-center',
      cellClassName: 'px-4 py-3',
      render: () => '',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-stone-900">
            {isCs ? 'ENERGIE A EMISE' : 'ENERGY & EMISSIONS'}
          </h3>
          <div className="text-xs text-stone-500">
            {isCs ? 'Původní verze k odstranění' : 'Original version to be removed'}
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        getRowId={(row) => (row.type === 'total' ? 'total' : row.source.id)}
        getRowClassName={(row) => (row.type === 'total' ? 'font-bold bg-stone-100 text-stone-900' : undefined)}
      />
    </div>
  );
}

