import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export interface PeriodData {
  id: string;
  period: string;
  occupancyRate: number | '';
  operatingDays: number | '';
  rooms: number | '';
  floorArea: number | '';
}

interface Props {
  data: PeriodData[];
  onChange: (data: PeriodData[]) => void;
  themeColor?: 'emerald' | 'blue' | 'orange' | 'amber' | 'yellow' | 'stone';
}

export default function PeriodDataInput({ data, onChange, themeColor = 'emerald' }: Props) {
  const { i18n } = useTranslation();
  const isCs = i18n.language === 'cs';

  // Ensure exactly 3 rows exist
  useEffect(() => {
    if (data.length !== 3) {
      const newData = [...data];
      while (newData.length < 3) {
        newData.push({
          id: Math.random().toString(36).substr(2, 9),
          period: '',
          occupancyRate: '',
          operatingDays: '',
          rooms: '',
          floorArea: ''
        });
      }
      if (newData.length > 3) {
        newData.length = 3;
      }
      onChange(newData);
    }
  }, [data, onChange]);

  const isLeapYear = (year: number) => {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  };

  const updatePeriod = (id: string, field: keyof PeriodData, value: string | number) => {
    let finalValue = value;
    
    if (value !== '') {
      if (field === 'occupancyRate') {
        const num = typeof value === 'number' ? value : parseFloat(value as string);
        if (!isNaN(num)) {
          if (num < 0) finalValue = 0;
          else if (num > 100) finalValue = 100;
          else finalValue = num;
        }
      } else if (field === 'operatingDays') {
        const num = typeof value === 'number' ? value : parseInt(value as string);
        if (!isNaN(num)) {
          if (num < 0) finalValue = 0;
          else if (num > 366) finalValue = 366;
          else finalValue = num;
        }
      } else if (field === 'rooms' || field === 'floorArea') {
        const num = typeof value === 'number' ? value : parseFloat(value as string);
        if (!isNaN(num)) {
          if (num < 0) finalValue = 0;
          else finalValue = num;
        }
      }
    }

    const newData = data.map(d => d.id === id ? { ...d, [field]: finalValue } : d);
    
    // Auto-calculate subsequent years if the first row's period is changed
    if (field === 'period' && data[0]?.id === id) {
      const baseYear = parseInt(finalValue as string, 10);
      if (!isNaN(baseYear)) {
        if (newData[1]) newData[1].period = (baseYear + 1).toString();
        if (newData[2]) newData[2].period = (baseYear + 2).toString();
      } else {
        if (newData[1]) newData[1].period = '';
        if (newData[2]) newData[2].period = '';
      }
    }
    
    onChange(newData);
  };

  const calculateRoomNight = (d: PeriodData) => {
    const occ = typeof d.occupancyRate === 'number' ? d.occupancyRate : 0;
    const days = typeof d.operatingDays === 'number' ? d.operatingDays : 0;
    const rooms = typeof d.rooms === 'number' ? d.rooms : 0;
    return (occ / 100) * days * rooms;
  };

  const formatWithSpaces = (value: number) => {
    return value.toLocaleString('cs-CZ').replace(/\u00A0/g, ' ');
  };

  const currentYear = new Date().getFullYear().toString();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold">{isCs ? 'Provozní údaje' : 'Operational Data'}</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-stone-500 uppercase bg-stone-50">
            <tr>
              <th className="px-4 py-3 rounded-tl-xl">{isCs ? 'Období' : 'Period'}</th>
              <th className="px-4 py-3">{isCs ? 'Obsazenost (%)' : 'Occupancy rate (%)'}</th>
              <th className="px-4 py-3">{isCs ? 'Provozní dny' : 'Operating days'}</th>
              <th className="px-4 py-3">{isCs ? 'Počet pokojů' : 'Number of rooms'}</th>
              <th className="px-4 py-3">{isCs ? 'Podlahová plocha (m²)' : 'Floor area (m2)'}</th>
              <th className="px-4 py-3 rounded-tr-xl">{isCs ? 'Pokojonoci' : 'Room night'}</th>
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 3).map((row, index) => (
              <tr key={row.id} className="border-b border-stone-100 last:border-0">
                <td className="px-4 py-3 align-top">
                  {index === 0 ? (
                    <input
                      type="number"
                      value={row.period}
                      onChange={(e) => updatePeriod(row.id, 'period', e.target.value)}
                      placeholder={currentYear}
                      className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-200"
                    />
                  ) : (
                    <div className="w-full p-2 bg-stone-100 border border-stone-200 rounded-lg text-stone-500 font-medium h-[38px] flex items-center">
                      {row.period || '-'}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 align-top">
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={row.occupancyRate}
                      onChange={(e) => updatePeriod(row.id, 'occupancyRate', e.target.value)}
                      className="w-full p-2 pr-8 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-200"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-medium pointer-events-none">%</span>
                  </div>
                </td>
                <td className="px-4 py-3 align-top">
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="366"
                      value={row.operatingDays}
                      onChange={(e) => updatePeriod(row.id, 'operatingDays', e.target.value)}
                      className="w-full p-2 pr-10 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-200"
                    />
                  </div>
                  {row.operatingDays === 366 && row.period && !isLeapYear(parseInt(row.period, 10)) && (
                    <div className="text-red-500 text-xs mt-1 font-medium">
                      {isCs ? 'Rok má max 365 dnů' : 'Year has max 365 days'}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 align-top">
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      value={row.rooms}
                      onChange={(e) => updatePeriod(row.id, 'rooms', e.target.value)}
                      className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-200"
                    />
                  </div>
                </td>
                <td className="px-4 py-3 align-top">
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      min="0"
                      value={typeof row.floorArea === 'number' ? formatWithSpaces(row.floorArea) : ''}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\s/g, '');
                        updatePeriod(row.id, 'floorArea', raw);
                      }}
                      className="w-32 p-2 pr-8 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-200"
                    />
                    <span className="absolute right-3 top-[19px] -translate-y-1/2 text-stone-400 text-xs font-medium pointer-events-none">m²</span>
                  </div>
                </td>
                <td className="px-4 py-3 align-top font-mono bg-stone-50/50 rounded-r-lg">
                  <div className="h-[38px] flex items-center">
                    {calculateRoomNight(row).toFixed(2)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
