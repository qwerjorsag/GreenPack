import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Droplets } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import AccommodationProfileInput from '../components/AccommodationProfileInput';
import PeriodDataInput, { PeriodData } from '../components/PeriodDataInput';
import BenchmarksThresholdsTable from '../components/BenchmarksThresholdsTable';
import WaterSourceTable from '../components/WaterSourceTable';
import WaterSummaryCard from '../components/WaterSummaryCard';
import { ConsentRow, PrimaryButton } from '../components/ui';

export default function Water() {
  const { i18n } = useTranslation();

  const [profile, setProfile] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [consent, setConsent] = useState(false);
  const [periods, setPeriods] = useState<PeriodData[]>([
    { id: '1', period: '', occupancyRate: '', operatingDays: '', rooms: '', floorArea: '' },
    { id: '2', period: '', occupancyRate: '', operatingDays: '', rooms: '', floorArea: '' },
    { id: '3', period: '', occupancyRate: '', operatingDays: '', rooms: '', floorArea: '' }
  ]);
  const [waterSources, setWaterSources] = useState([
    {
      id: 'municipal',
      labelCs: 'Městský vodovod',
      labelEn: 'Municipal water supply',
      withdrawn: '',
      returned: '',
    },
    {
      id: 'groundwater',
      labelCs: 'Podzemní voda (vlastní vrt)',
      labelEn: 'Groundwater (own borehole)',
      withdrawn: '',
      returned: '',
    },
    {
      id: 'rainwater',
      labelCs: 'Zachytávání dešťové vody',
      labelEn: 'Rainwater harvesting',
      withdrawn: '',
      returned: '',
    },
    {
      id: 'greywater',
      labelCs: 'Recyklace / šedá voda',
      labelEn: 'Recycled / greywater use',
      withdrawn: '',
      returned: '',
    },
    {
      id: 'other',
      labelCs: 'Jiné',
      labelEn: 'Other',
      withdrawn: '',
      returned: '',
    },
  ]);
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
  const waterDisabled = isSubmitting || hasInvalidOperatingDays || hasEmptyFields || missingConsent || missingProfile;
  const waterTooltip = i18n.language === 'cs'
    ? missingProfile
      ? 'Vyberte profil ubytování.'
      : hasInvalidOperatingDays
        ? 'Rok má max 365 dnů.'
        : hasEmptyFields
          ? 'Vyplňte všechna pole v tabulkách: Provozní údaje a Zdroje vody.'
          : missingConsent
            ? 'Je nutné souhlasit se zpracováním údajů.'
            : ''
    : missingProfile
      ? 'Please select an accommodation profile.'
      : hasInvalidOperatingDays
        ? 'The year has a maximum of 365 days.'
        : hasEmptyFields
          ? 'Please complete all fields in the tables: Operational Data and Water Sources.'
          : missingConsent
            ? 'You must agree to data processing.'
            : '';

  const handleSubmit = () => {
    if (hasInvalidOperatingDays || hasEmptyFields || !consent || !profile) return;
    setIsSubmitting(true);
    const payload = { profile, periods };
    if (typeof window !== 'undefined') {
      const draft = JSON.parse(window.localStorage.getItem('greenpack_draft') || '{}');
      draft.water = payload;
      window.localStorage.setItem('greenpack_draft', JSON.stringify(draft));
    }
    setTimeout(() => {
      setIsSubmitting(false);
      window.alert(i18n.language === 'cs' ? 'Data odeslána. PDF bude doplněno později.' : 'Data submitted. PDF generation will be added later.');
    }, 300);
  };

  const totalWithdrawn = waterSources.reduce((sum, r) => sum + (typeof r.withdrawn === 'number' ? r.withdrawn : 0), 0);
  const recycledRow = waterSources.find((r) => r.id === 'greywater');
  const recycledShare = totalWithdrawn > 0 && recycledRow && typeof recycledRow.withdrawn === 'number'
    ? (recycledRow.withdrawn / totalWithdrawn) * 100
    : 0;
  const totalRoomNights = periods.reduce((sum, p) => {
    const occ = typeof p.occupancyRate === 'number' ? p.occupancyRate : 0;
    const days = typeof p.operatingDays === 'number' ? p.operatingDays : 0;
    const rooms = typeof p.rooms === 'number' ? p.rooms : 0;
    return sum + (occ / 100) * days * rooms;
  }, 0);
  const perRoomNightM3 = totalRoomNights > 0 ? totalWithdrawn / totalRoomNights : 0;
  return (
    <div className="min-h-screen bg-blue-50/90 font-sans text-stone-900">
      <PageHeader 
        title={i18n.language === 'cs' ? 'Voda' : 'Water'}
        description={i18n.language === 'cs' ? 'Voda je vzácný zdroj. Naše metodika pomáhá ubytovacím zařízením identifikovat úniky a možnosti pro recyklaci šedé vody.' : 'Water is a precious resource. Our methodology helps accommodation facilities identify leaks and opportunities for greywater recycling.'}
        icon={<Droplets className="w-6 h-6 text-white" />}
        themeColor="blue"
      />

      <main className="max-w-5xl mx-auto px-3 md:px-6 py-16 bg-transparent">
        <div className="gp-card">
          <div className="mb-12">
            <AccommodationProfileInput value={profile} onChange={setProfile} themeColor="blue" />
          </div>

            <PeriodDataInput data={periods} onChange={setPeriods} themeColor="blue" />

        </div>

        <div className="gp-card">
          <WaterSourceTable
            isCs={i18n.language === 'cs'}
            rows={waterSources}
            onChange={setWaterSources}
          />
        </div>

        <WaterSummaryCard
          isCs={i18n.language === 'cs'}
          totalWaterM3={totalWithdrawn}
          recycledShare={recycledShare}
          perRoomNightM3={perRoomNightM3}
        />

        <div className="gp-card">
          <BenchmarksThresholdsTable
            years={yearsForConsumption}
            valuesByYear={placeholderValues}
            ratingMatrixSource="water"
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
            themeColor="blue"
          />
          <span className="group relative inline-block">
            <PrimaryButton
              onClick={handleSubmit}
              disabled={waterDisabled}
              themeColor="blue"
            >
              {isSubmitting ? (i18n.language === 'cs' ? 'Generuji...' : 'Generating...') : (i18n.language === 'cs' ? 'Generovat PDF' : 'Generate PDF')}
            </PrimaryButton>
            {waterDisabled && (
              <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-3 w-72 -translate-x-1/2 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-stone-700 shadow-lg opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                {waterTooltip}
              </div>
            )}
          </span>
          <Link
            to="/wateraudit"
            className="mt-6 px-6 py-3 rounded-2xl border border-stone-300 text-stone-900 font-bold uppercase tracking-widest text-sm hover:bg-blue-600 hover:text-white hover:scale-105 transition-all"
          >
            {i18n.language === 'cs' ? 'Přejít na Self-Audit vody' : 'Go to Water Self-Audit'}
          </Link>
        </div>
      </div>
      
    </div>
  );
}
