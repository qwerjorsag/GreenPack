import React from 'react';
import { useTranslation } from 'react-i18next';
import { Building, Coffee, Home, Utensils, Waves } from 'lucide-react';

export interface Profile {
  id: string;
  titleEn: string;
  titleCs: string;
  icon: React.ReactNode;
}

export const ACCOMMODATION_PROFILES: Profile[] = [
  {
    id: '1',
    titleEn: 'Guesthouse / Pension - only accommodation, no gastronomy',
    titleCs: 'Penzion - pouze ubytování, bez gastronomie',
    icon: <Building className="w-6 h-6" />
  },
  {
    id: '2',
    titleEn: 'Hotel / Pension - only continental breakfast, reception, basic services',
    titleCs: 'Hotel / Penzion - pouze kontinentální snídaně, recepce, základní služby',
    icon: <Coffee className="w-6 h-6" />
  },
  {
    id: '3',
    titleEn: 'Self-catering accommodation, small accommodation',
    titleCs: 'Ubytování s vlastním stravováním, malé ubytování',
    icon: <Home className="w-6 h-6" />
  },
  {
    id: '4',
    titleEn: 'Hotel with restaurant - full gastronomy',
    titleCs: 'Hotel s restaurací - plná gastronomie',
    icon: <Utensils className="w-6 h-6" />
  },
  {
    id: '5',
    titleEn: 'Hotel with wellness / pool / conferences - high consumption',
    titleCs: 'Hotel s wellness / bazénem / konferencemi - vysoká spotřeba',
    icon: <Waves className="w-6 h-6" />
  }
];

interface Props {
  value: string;
  onChange: (val: string) => void;
  themeColor?: 'emerald' | 'blue' | 'orange' | 'amber' | 'yellow' | 'stone';
}

export default function AccommodationProfileInput({ value, onChange, themeColor = 'emerald' }: Props) {
  const { i18n } = useTranslation();
  const isCs = i18n.language === 'cs';
  const selected = ACCOMMODATION_PROFILES.find((p) => p.id === value);

  const colorClasses = {
    emerald: 'border-emerald-500 bg-emerald-50/50 text-emerald-700',
    blue: 'border-blue-500 bg-blue-50/50 text-blue-700',
    orange: 'border-orange-500 bg-orange-50/50 text-orange-700',
    amber: 'border-amber-500 bg-amber-50/50 text-amber-700',
    stone: 'border-stone-500 bg-stone-50/60 text-stone-700',
    yellow: 'border-yellow-500 bg-yellow-50/50 text-yellow-800',
  };

  const activeClass = colorClasses[themeColor];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold" data-pdf-title>{isCs ? 'Profil ubytování' : 'Accommodation Profile'}</h3>
      <div data-pdf-show style={{ display: 'none' }}>
        <div className="text-sm font-medium">
          {selected ? (isCs ? selected.titleCs : selected.titleEn) : '-'}
        </div>
        <div data-pdf-space />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" data-pdf-hide>
        {ACCOMMODATION_PROFILES.map(p => (
          <button
            key={p.id}
            type="button"
            onClick={() => onChange(p.id)}
            className={`flex flex-col items-start p-4 rounded-2xl border-2 text-left transition-all ${
              value === p.id 
                ? activeClass
                : 'border-stone-100 bg-white hover:border-stone-200'
            }`}
          >
            <div className={`mb-3 ${value === p.id ? '' : 'text-stone-400'}`}>
              {p.icon}
            </div>
            <span className="text-sm font-medium leading-snug">
              {isCs ? p.titleCs : p.titleEn}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
