import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import AccommodationProfileInput from '../components/AccommodationProfileInput';
import PeriodDataInput, { PeriodData } from '../components/PeriodDataInput';
import BenchmarksThresholdsTable from '../components/BenchmarksThresholdsTable';
import WasteStreamTable from '../components/WasteStreamTable';
import WasteSummaryCard from '../components/WasteSummaryCard';
import { ConsentRow, PrimaryButton } from '../components/ui';

export default function Waste() {
  const { i18n } = useTranslation();

  const [profile, setProfile] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [consent, setConsent] = useState(false);
  const [periods, setPeriods] = useState<PeriodData[]>([
    { id: '1', period: '', occupancyRate: '', operatingDays: '', rooms: '', floorArea: '' },
    { id: '2', period: '', occupancyRate: '', operatingDays: '', rooms: '', floorArea: '' },
    { id: '3', period: '', occupancyRate: '', operatingDays: '', rooms: '', floorArea: '' }
  ]);
  const [wasteStreams, setWasteStreams] = useState([
    {
      id: 'mixed',
      labelCs: 'Směsný komunální odpad',
      labelEn: 'Mixed municipal waste',
      notesCs: 'Zbytkový odpad ukládaný do směsného odpadu (skládka/spalovna).',
      notesEn: 'Residual waste sent to general disposal (landfill/incineration).',
      quantity: '',
      destination: '',
      recycled: '',
      recovered: '',
    },
    {
      id: 'paper',
      labelCs: 'Papír a lepenka',
      labelEn: 'Paper and cardboard',
      notesCs: 'Kancelářský a obalový papír/lepenka.',
      notesEn: 'Office and packaging paper/cardboard.',
      quantity: '',
      destination: '',
      recycled: '',
      recovered: '',
    },
    {
      id: 'plastics',
      labelCs: 'Plasty',
      labelEn: 'Plastics',
      notesCs: 'Obalové materiály a lahve.',
      notesEn: 'Packaging materials and bottles.',
      quantity: '',
      destination: '',
      recycled: '',
      recovered: '',
    },
    {
      id: 'glass',
      labelCs: 'Sklo',
      labelEn: 'Glass',
      notesCs: 'Lahve a sklenice.',
      notesEn: 'Bottles and jars.',
      quantity: '',
      destination: '',
      recycled: '',
      recovered: '',
    },
    {
      id: 'metal',
      labelCs: 'Kov',
      labelEn: 'Metal',
      notesCs: 'Hliník, ocelové plechovky apod.',
      notesEn: 'Aluminium, steel cans, etc.',
      quantity: '',
      destination: '',
      recycled: '',
      recovered: '',
    },
    {
      id: 'organic',
      labelCs: 'Organický / potravinový odpad',
      labelEn: 'Organic / Food waste',
      notesCs: 'Kuchyňský a restaurační odpad; vhodné pro kompost/AD.',
      notesEn: 'Kitchen and restaurant waste; suitable for composting/AD.',
      quantity: '',
      destination: '',
      recycled: '',
      recovered: '',
    },
    {
      id: 'other',
      labelCs: 'Ostatní (e-odpad, nebezpečný)',
      labelEn: 'Other (e-waste, hazardous)',
      notesCs: 'Baterie, žárovky, chemikálie – specializované zpracování.',
      notesEn: 'Batteries, bulbs, chemicals – specialised treatment.',
      quantity: '',
      destination: '',
      recycled: '',
      recovered: '',
    },
  ]);

  const formatWithSpaces = (value: number) => {
    return value.toLocaleString('cs-CZ').replace(/\u00A0/g, ' ');
  };

  const totalWaste = wasteStreams.reduce((sum, r) => sum + (typeof r.quantity === 'number' ? r.quantity : 0), 0);
  const totalRecycled = wasteStreams.reduce((sum, r) => sum + (typeof r.recycled === 'number' ? r.recycled : 0), 0);
  const recyclingRate = totalWaste > 0 ? (totalRecycled / totalWaste) * 100 : 0;
  const yearsForConsumption = periods.slice(0, 3).map((p, idx) => Number(p.period || 0) || 2024 + idx);
  const placeholderValues = {
    energyIntensityM2: [null, null, null],
    energyIntensityRoomNight: [null, null, null],
    emissionsIntensityM2: [null, null, null],
    emissionsIntensityRoomNight: [null, null, null],
    renewableShare: [null, null, null],
  };

  const isLeapYear = (year: number) => {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  };

  const hasInvalidOperatingDays = periods.some((p) => {
    if (p.operatingDays !== 366) return false;
    const year = parseInt(p.period || '', 10);
    if (!year) return true;
    return !isLeapYear(year);
  });

  const hasEmptyFields = periods.some((p) => {
    return (
      !p.period ||
      p.occupancyRate === '' ||
      p.operatingDays === '' ||
      p.rooms === '' ||
      p.floorArea === ''
    );
  });

  const missingProfile = !profile;
  const missingConsent = !consent;
  const wasteDisabled = isSubmitting || hasInvalidOperatingDays || hasEmptyFields || missingConsent || missingProfile;
  const wasteTooltip = i18n.language === 'cs'
    ? missingProfile
      ? 'Vyberte profil ubytování.'
      : hasInvalidOperatingDays
        ? 'Rok má max 365 dnů.'
        : hasEmptyFields
          ? 'Vyplňte všechna pole v tabulkách: Provozní údaje a Toky odpadu.'
          : missingConsent
            ? 'Je nutné souhlasit se zpracováním údajů.'
            : ''
    : missingProfile
      ? 'Please select an accommodation profile.'
      : hasInvalidOperatingDays
        ? 'The year has a maximum of 365 days.'
        : hasEmptyFields
          ? 'Please complete all fields in the tables: Operational Data and Waste Streams.'
          : missingConsent
            ? 'You must agree to data processing.'
            : '';

  const handleSubmit = () => {
    if (hasInvalidOperatingDays || hasEmptyFields || !consent || !profile) return;
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
    <div className="min-h-screen bg-black/5 font-sans text-stone-900">
      <PageHeader 
        title={i18n.language === 'cs' ? 'Odpad' : 'Waste'}
        description={i18n.language === 'cs' ? 'Efektivní nakládání s odpady snižuje náklady na odvoz a zlepšuje image vašeho ubytování u hostů.' : 'Effective waste management reduces disposal costs and improves the image of your accommodation with guests.'}
        icon={<Trash2 className="w-6 h-6 text-white" />}
        themeColor="stone"
      />

      <main className="max-w-5xl mx-auto px-3 md:px-6 py-16 bg-transparent">
        <div className="gp-card">
          <div className="mb-12">
            <AccommodationProfileInput value={profile} onChange={setProfile} themeColor="stone" />
          </div>
          <div>
            <PeriodDataInput data={periods} onChange={setPeriods} themeColor="stone" />
          </div>
        </div>

        <div className="gp-card">
          <WasteStreamTable
            isCs={i18n.language === 'cs'}
            rows={wasteStreams}
            onChange={setWasteStreams}
          />
        </div>

        <WasteSummaryCard
          isCs={i18n.language === 'cs'}
          totalWasteKg={totalWaste}
          recycledKg={totalRecycled}
          recyclingRate={recyclingRate}
        />

        <div className="gp-card">
          <BenchmarksThresholdsTable
            years={yearsForConsumption}
            valuesByYear={placeholderValues}
            ratingMatrixSource="waste"
          />
        </div>

      </main>

      <div className="max-w-5xl mx-auto px-3 md:px-6 pb-16">
        <div className="flex flex-col items-center gap-4">
          <ConsentRow
            checked={consent}
            onChange={setConsent}
            label={i18n.language === 'cs'
              ? 'Odesláním souhlasím se zpracováním vložených údajů.'
              : 'By submitting I agree to the processing of the entered data.'}
            themeColor="stone"
          />
          <span className="group relative inline-block">
            <PrimaryButton
              onClick={handleSubmit}
              disabled={wasteDisabled}
              themeColor="stone"
            >
              {isSubmitting ? (i18n.language === 'cs' ? 'Generuji...' : 'Generating...') : (i18n.language === 'cs' ? 'Generovat PDF' : 'Generate PDF')}
          </PrimaryButton>
            {wasteDisabled && (
              <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-3 w-72 -translate-x-1/2 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-stone-700 shadow-lg opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                {wasteTooltip}
              </div>
            )}
          </span>
          <Link
            to="/wasteaudit"
            className="mt-6 px-6 py-3 rounded-2xl border border-stone-300 text-stone-900 font-bold uppercase tracking-widest text-sm hover:bg-stone-700 hover:text-white hover:scale-105 transition-all"
          >
            {i18n.language === 'cs' ? 'Přejít na Self-Audit odpadu' : 'Go to Waste Self-Audit'}
          </Link>
        </div>
      </div>
      
    </div>
  );
}
