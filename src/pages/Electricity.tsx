import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Lightbulb, Wind, Zap } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import AccommodationProfileInput from '../components/AccommodationProfileInput';
import PeriodDataInput, { PeriodData } from '../components/PeriodDataInput';
import EnergyEmissionsInput from '../components/EnergyEmissionsInput';

export default function Electricity() {
  const { i18n } = useTranslation();
  const isCs = i18n.language === 'cs';

  const [profile, setProfile] = useState('1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [periods, setPeriods] = useState<PeriodData[]>([
    { id: '1', period: '', occupancyRate: '', operatingDays: '', rooms: '', floorArea: '' },
    { id: '2', period: '', occupancyRate: '', operatingDays: '', rooms: '', floorArea: '' },
    { id: '3', period: '', occupancyRate: '', operatingDays: '', rooms: '', floorArea: '' }
  ]);

  const handleSubmit = () => {
    setIsSubmitting(true);
    const payload = { profile, periods };
    if (typeof window !== 'undefined') {
      const draft = JSON.parse(window.localStorage.getItem('greenpack_draft') || '{}');
      draft.electricity = payload;
      window.localStorage.setItem('greenpack_draft', JSON.stringify(draft));
    }
    setTimeout(() => {
      setIsSubmitting(false);
      window.alert(isCs ? 'Data odeslána. PDF bude doplněno později.' : 'Data submitted. PDF generation will be added later.');
    }, 300);
  };

  return (
    <div className="min-h-screen bg-yellow-50/30 font-sans text-stone-900">
      <PageHeader 
        title={isCs ? 'Elektřina' : 'Electricity'}
        description={isCs
          ? 'Energie je jedním z největších nákladů i dopadů na životní prostředí v ubytovacím sektoru. Zjistěte si Vaši hospodárnost.'
          : 'Energy is one of the largest costs and environmental impacts in the accommodation sector.'}
        icon={<Zap className="w-6 h-6" />}
        themeColor="yellow"
      />

      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-stone-200 mb-12">
          <div className="mb-12">
            <AccommodationProfileInput value={profile} onChange={setProfile} themeColor="yellow" />
          </div>
          <div className="mb-12">
            <PeriodDataInput data={periods} onChange={setPeriods} themeColor="yellow" />
          </div>
          <div>
            <EnergyEmissionsInput themeColor="yellow" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm">
            <Lightbulb className="w-10 h-10 text-yellow-500 mb-6" />
            <h3 className="text-xl font-bold mb-4">{isCs ? 'Efektivní osvětlení' : 'Efficient Lighting'}</h3>
            <p className="text-stone-500 text-sm leading-relaxed">
              {isCs 
                ? 'Přechod na LED osvětlení a instalace pohybových senzorů může snížit spotřebu energie na svícení až o 70%.' 
                : 'Switching to LED lighting and installing motion sensors can reduce lighting energy consumption by up to 70%.'}
            </p>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm">
            <Wind className="w-10 h-10 text-yellow-500 mb-6" />
            <h3 className="text-xl font-bold mb-4">{isCs ? 'Obnovitelné zdroje' : 'Renewable Sources'}</h3>
            <p className="text-stone-500 text-sm leading-relaxed">
              {isCs 
                ? 'Instalace solárních panelů nebo nákup energie z certifikovaných obnovitelných zdrojů výrazně snižuje vaši uhlíkovou stopu.' 
                : 'Installing solar panels or purchasing energy from certified renewable sources significantly reduces your carbon footprint.'}
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-3 rounded-2xl bg-yellow-500 text-black font-bold uppercase tracking-widest text-sm shadow-md shadow-yellow-900/10 hover:bg-yellow-400 transition-all disabled:opacity-60"
          >
            {isSubmitting ? (isCs ? 'Odesílám...' : 'Submitting...') : (isCs ? 'Odeslat' : 'Submit')}
          </button>
        </div>
      </main>
      
    </div>
  );
}
