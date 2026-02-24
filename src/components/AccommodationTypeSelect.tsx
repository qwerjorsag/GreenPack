import React from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, Home, Tent, Users, Info } from 'lucide-react';

interface AccommodationTypeSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export default function AccommodationTypeSelect({ value, onChange }: AccommodationTypeSelectProps) {
  const { i18n } = useTranslation();
  const isCs = i18n.language === 'cs';

  const types = [
    {
      id: 'hotel',
      icon: <Building2 className="w-6 h-6" />,
      title: isCs ? 'Hotel' : 'Hotel',
      description: isCs ? 'Tradiční ubytovací zařízení s recepcí a službami.' : 'Traditional accommodation with reception and services.',
      tooltip: isCs ? 'Zahrnuje hotely, motely a penziony s každodenním úklidem.' : 'Includes hotels, motels, and guesthouses with daily housekeeping.'
    },
    {
      id: 'hostel',
      icon: <Users className="w-6 h-6" />,
      title: isCs ? 'Hostel' : 'Hostel',
      description: isCs ? 'Sdílené ubytování zaměřené na komunitu.' : 'Shared accommodation focused on community.',
      tooltip: isCs ? 'Zařízení se sdílenými pokoji (dormitory) a společným sociálním zařízením.' : 'Facilities with shared rooms (dormitories) and shared bathrooms.'
    },
    {
      id: 'apartment',
      icon: <Home className="w-6 h-6" />,
      title: isCs ? 'Apartmán' : 'Apartment',
      description: isCs ? 'Samostatné bytové jednotky s vlastní kuchyní.' : 'Self-contained units with private kitchens.',
      tooltip: isCs ? 'Krátkodobé pronájmy celých bytů nebo domů bez každodenního úklidu.' : 'Short-term rentals of entire apartments or houses without daily housekeeping.'
    },
    {
      id: 'campsite',
      icon: <Tent className="w-6 h-6" />,
      title: isCs ? 'Kemp' : 'Campsite',
      description: isCs ? 'Venkovní ubytování pro stany a karavany.' : 'Outdoor accommodation for tents and caravans.',
      tooltip: isCs ? 'Zahrnuje tradiční kempy, glamping a stání pro karavany.' : 'Includes traditional campsites, glamping, and caravan pitches.'
    }
  ];

  return (
    <div className="space-y-3">
      <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-3">
        {isCs ? 'Druh ubytovacího zařízení' : 'Accommodation Type'}
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {types.map((type) => (
          <button
            key={type.id}
            type="button"
            onClick={() => onChange(type.id)}
            className={`relative flex flex-col items-start p-5 rounded-2xl border-2 text-left transition-all ${
              value === type.id 
                ? 'border-emerald-500 bg-emerald-50/50 shadow-md shadow-emerald-900/5' 
                : 'border-stone-100 bg-white hover:border-emerald-200 hover:bg-emerald-50/30'
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
              value === type.id ? 'bg-emerald-500 text-white' : 'bg-stone-100 text-stone-500'
            }`}>
              {type.icon}
            </div>
            <div className="font-bold text-stone-900 mb-1">{type.title}</div>
            <div className="text-xs text-stone-500 leading-relaxed mb-2">{type.description}</div>
            
            {/* Tooltip trigger */}
            <div className="group absolute top-4 right-4">
              <Info className={`w-5 h-5 ${value === type.id ? 'text-emerald-500' : 'text-stone-300'}`} />
              <div className="absolute bottom-full right-0 mb-2 w-48 p-3 bg-stone-900 text-white text-xs rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 shadow-xl">
                {type.tooltip}
                <div className="absolute top-full right-2 w-2 h-2 bg-stone-900 transform rotate-45 -mt-1"></div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
