import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2 } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import AccommodationProfileInput from '../components/AccommodationProfileInput';
import PeriodDataInput, { PeriodData } from '../components/PeriodDataInput';

export default function Waste() {
  const { t, i18n } = useTranslation();

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
      draft.waste = payload;
      window.localStorage.setItem('greenpack_draft', JSON.stringify(draft));
    }
    setTimeout(() => {
      setIsSubmitting(false);
      window.alert(i18n.language === 'cs' ? 'Data odeslána. PDF bude doplněno později.' : 'Data submitted. PDF generation will be added later.');
    }, 300);
  };
  return (
    <div className="min-h-screen bg-stone-50/60 font-sans text-stone-900">
      <PageHeader 
        title={i18n.language === 'cs' ? 'Odpad' : 'Waste'}
        description={i18n.language === 'cs' ? 'EfektivnĂ­ naklĂˇdĂˇnĂ­ s odpady sniĹľuje nĂˇklady na odvoz a zlepĹˇuje image vaĹˇeho ubytovĂˇnĂ­ u hostĹŻ.' : 'Effective waste management reduces disposal costs and improves the image of your accommodation with guests.'}
        icon={<Trash2 className="w-6 h-6 text-white" />}
        themeColor="stone"
      />

      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-stone-200 mb-12">
          <div className="mb-12">
            <AccommodationProfileInput value={profile} onChange={setProfile} themeColor="stone" />
          </div>
          <div>
            <PeriodDataInput data={periods} onChange={setPeriods} themeColor="stone" />
          </div>
        </div>

        <div className="bg-white rounded-[3rem] p-12 shadow-sm border border-stone-200 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold mb-6">{i18n.language === 'cs' ? 'Co mÄ›Ĺ™Ă­me?' : 'What we measure?'}</h3>
              <ul className="space-y-4">
                {[
                  { label: t('fields.wasteTotal'), value: 'kg' },
                  { label: t('fields.wasteRecycled'), value: 'kg' },
                  { label: i18n.language === 'cs' ? 'MĂ­ra recyklace' : 'Recycling rate', value: '%' }
                ].map((item, i) => (
                  <li key={i} className="flex justify-between items-center p-4 bg-stone-50 rounded-2xl">
                    <span className="text-stone-600 font-medium">{item.label}</span>
                    <span className="px-3 py-1 bg-white border border-stone-200 rounded-lg text-xs font-bold">{item.value}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-6">{i18n.language === 'cs' ? 'ProÄŤ je to dĹŻleĹľitĂ©?' : 'Why it matters?'}</h3>
              <p className="text-stone-500 leading-relaxed mb-6">
                {i18n.language === 'cs'
                  ? 'PrĹŻmÄ›rnĂ˝ hotel vyprodukuje 1 kg odpadu na hosta a noc. SprĂˇvnĂ˝m tĹ™Ă­dÄ›nĂ­m lze recyklovat aĹľ 80 % tohoto objemu.'
                  : 'The average hotel produces 1 kg of waste per guest per night. With proper sorting, up to 80% of this volume can be recycled.'}
              </p>
              <div className="p-6 bg-stone-100 rounded-3xl border border-stone-200">
                <p className="text-stone-700 text-sm font-medium italic">
                  "There is no such thing as 'away'. When we throw anything away, it must go somewhere." â€” Annie Leonard
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-3 rounded-2xl bg-stone-700 text-white font-bold uppercase tracking-widest text-sm shadow-md shadow-stone-900/10 hover:bg-stone-600 transition-all disabled:opacity-60"
          >
            {isSubmitting ? (i18n.language === 'cs' ? 'Odesílám...' : 'Submitting...') : (i18n.language === 'cs' ? 'Odeslat' : 'Submit')}
          </button>
        </div>
      </main>
      
    </div>
  );
}
