import React from 'react';
import InfoTooltip from '../InfoTooltip';

type WaterRow = {
  id: string;
  labelCs: string;
  labelEn: string;
  withdrawn: number | '';
  returned: number | '';
};

type Props = {
  isCs: boolean;
  rows: WaterRow[];
  onChange: (rows: WaterRow[]) => void;
};

const formatWithSpaces = (value: number) => {
  return value.toLocaleString('cs-CZ').replace(/\u00A0/g, ' ');
};

export default function WaterSourceTable({ isCs, rows, onChange }: Props) {
  const handleChange = (rowId: string, field: keyof WaterRow, raw: string) => {
    const next = rows.map((row) => {
      if (row.id !== rowId) return row;
      if (raw === '') return { ...row, [field]: '' };
      const num = Math.round(parseFloat(raw));
      return { ...row, [field]: Number.isNaN(num) ? '' : Math.max(0, num) };
    });
    onChange(next);
  };

  const blockSigns = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === '+' || e.key === '-' || e.key === 'e' || e.key === 'E') {
      e.preventDefault();
    }
  };

  const tooltipMap: Record<string, { cs: string; en: string }> = {
    municipal: {
      cs: 'Pitná voda z městské sítě.',
      en: 'Potable water from municipal network.',
    },
    groundwater: {
      cs: 'Vlastní čerstvá voda; pouze povolený odběr.',
      en: 'Self-supplied fresh water; include only permitted extraction.',
    },
    rainwater: {
      cs: 'Zachycená dešťová voda použitá v areálu (obvykle nepitná).',
      en: 'Collected rainwater used on site (typically non-potable).',
    },
    greywater: {
      cs: 'Voda znovu použitá pro toalety, závlahu, prádelnu, chlazení apod.',
      en: 'Water reused for toilets, irrigation, laundry, cooling, etc.',
    },
    other: {
      cs: 'Cisterny nebo jiné zdroje neuvedené výše.',
      en: 'Tankers or other sources not listed above.',
    },
  };

  const computed = rows.map((row) => {
    const withdrawn = typeof row.withdrawn === 'number' ? row.withdrawn : 0;
    const returned = typeof row.returned === 'number' ? row.returned : 0;
    const consumed = Math.max(0, withdrawn - returned);
    return { ...row, withdrawn, returned, consumed };
  });

  const totalWithdrawn = computed.reduce((sum, r) => sum + r.withdrawn, 0);
  const totalReturned = computed.reduce((sum, r) => sum + r.returned, 0);
  const totalConsumed = computed.reduce((sum, r) => sum + r.consumed, 0);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3>{isCs ? 'Zdroje vody' : 'Water source'}</h3>
      </div>

      <div className="gp-table-wrap">
        <table className="gp-table">
          <thead className="gp-table-head">
            <tr>
              <th className="gp-th gp-th-left">{isCs ? 'Zdroj vody' : 'Water source'}</th>
              <th className="gp-th gp-th-center w-6 hidden md:table-cell"></th>
              <th className="gp-th gp-th-center">{isCs ? 'Odebráno (m³/rok)' : 'Withdrawn (m³/year)'}</th>
              <th className="gp-th gp-th-center">{isCs ? 'Vráceno do stejného zdroje (m³/rok)' : 'Returned to same source (m³/year)'}</th>
              <th className="gp-th gp-th-center">{isCs ? 'Spotřebováno (m³/rok)' : 'Consumed (m³/year)'}</th>
              <th className="gp-th gp-th-center gp-th-right">{isCs ? 'Podíl z celkového odběru (%)' : 'Share of total withdrawn (%)'}</th>
            </tr>
          </thead>
          <tbody>
            {computed.map((row) => {
              const share = totalWithdrawn > 0 ? (row.withdrawn / totalWithdrawn) * 100 : 0;
              return (
              <tr key={row.id} className="gp-row">
                <td className="gp-td font-medium">{isCs ? row.labelCs : row.labelEn}</td>
                <td className="gp-td gp-td-center w-6 hidden md:table-cell">
                  <div className="flex justify-center">
                    <InfoTooltip
                      label="Info"
                      content={tooltipMap[row.id]?.[isCs ? 'cs' : 'en'] || ''}
                    />
                  </div>
                </td>
                <td className="gp-td gp-td-center">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={typeof row.withdrawn === 'number' && row.withdrawn !== 0 ? formatWithSpaces(row.withdrawn) : ''}
                      onChange={(e) => handleChange(row.id, 'withdrawn', e.target.value.replace(/\s/g, ''))}
                      onKeyDown={blockSigns}
                      className="w-full p-1.5 md:p-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-200"
                      placeholder="0"
                    />
                </td>
                <td className="gp-td gp-td-center">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={typeof row.returned === 'number' && row.returned !== 0 ? formatWithSpaces(row.returned) : ''}
                      onChange={(e) => handleChange(row.id, 'returned', e.target.value.replace(/\s/g, ''))}
                      onKeyDown={blockSigns}
                      className="w-full p-1.5 md:p-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-200"
                      placeholder="0"
                    />
                </td>
                <td className="gp-td gp-td-center">
                  {formatWithSpaces(row.consumed)}
                </td>
                <td className="gp-td gp-td-center">
                  {share.toFixed(1).replace('.', ',')}
                </td>
              </tr>
            );
            })}

            <tr className="font-bold bg-stone-100 text-stone-900">
              <td className="gp-td uppercase">{isCs ? 'Celkem (m³)' : 'Total (m³)'}</td>
              <td className="gp-td gp-td-center hidden md:table-cell"></td>
              <td className="gp-td gp-td-center">{formatWithSpaces(totalWithdrawn)}</td>
              <td className="gp-td gp-td-center">{formatWithSpaces(totalReturned)}</td>
              <td className="gp-td gp-td-center">{formatWithSpaces(totalConsumed)}</td>
              <td className="gp-td gp-td-center"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
