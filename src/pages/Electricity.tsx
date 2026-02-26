import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Lightbulb, Wind, Zap } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import AccommodationProfileInput, { ACCOMMODATION_PROFILES } from '../components/AccommodationProfileInput';
import PeriodDataInput, { PeriodData } from '../components/PeriodDataInput';
import EnergyEmissionsInput, { ENERGY_SOURCES } from '../components/EnergyEmissionsInput';
import EnergyManagementTable from '../components/EnergyManagementTable';
import EnergyByPeriodInput from '../components/EnergyByPeriodInput';
import EnergyConsumptionTable from '../components/EnergyConsumptionTable';
import EnergyRenewablesSummary from '../components/EnergyRenewablesSummary';
import BenchmarksThresholdsTable from '../components/BenchmarksThresholdsTable';
import { generateElectricityVectorPdf } from '../functions/generateElectricityVectorPdf';
import { ConsentRow, PrimaryButton, SecondaryButton, SectionCard } from '../components/ui';
import { useElectricityDerived } from '../hooks/useElectricityDerived';
import { useElectricityValidation } from '../hooks/useElectricityValidation';
import { buildElectricityPdfData } from '../functions/buildElectricityPdfData';
import pdfLogoCz from '../assets/logos/hk_cr_-logo_cz-logo_zakladni_black.png';
import pdfLogoEn from '../assets/logos/hk_cr_logo_aj_black.png';

export default function Electricity() {
  const { i18n } = useTranslation();
  const isCs = i18n.language === 'cs';

  const [profile, setProfile] = useState('1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPdfButton, setShowPdfButton] = useState(false);
  const [consent, setConsent] = useState(false);
  const [energyValues, setEnergyValues] = useState<Record<string, number | ''>>({});
  const [energyByPeriod, setEnergyByPeriod] = useState<Record<string, number | ''>[]>([
    {},
    {},
    {}
  ]);
  const [periods, setPeriods] = useState<PeriodData[]>([
    { id: '1', period: '', occupancyRate: '', operatingDays: '', rooms: '', floorArea: '' },
    { id: '2', period: '', occupancyRate: '', operatingDays: '', rooms: '', floorArea: '' },
    { id: '3', period: '', occupancyRate: '', operatingDays: '', rooms: '', floorArea: '' }
  ]);

  const { hasInvalidOperatingDays, hasEmptyFields } = useElectricityValidation(periods);

  const {
    perPeriodTotals,
    perPeriodIndicators,
    benchmarkValues,
    yearsForConsumption,
    denominatorsForConsumption,
    valuesForConsumption,
  } = useElectricityDerived(periods, energyByPeriod);


  const handleSubmit = () => {
    if (hasInvalidOperatingDays || hasEmptyFields) return;
    setIsSubmitting(true);
    const energyValuesNormalized = ENERGY_SOURCES.reduce<Record<string, number>>((acc, source) => {
      const val = energyValues[source.id];
      acc[source.id] = typeof val === 'number' ? val : 0;
      return acc;
    }, {});
    const energyByPeriodNormalized = energyByPeriod.map((periodValues) =>
      ENERGY_SOURCES.reduce<Record<string, number>>((acc, source) => {
        const val = periodValues?.[source.id];
        acc[source.id] = typeof val === 'number' ? val : 0;
        return acc;
      }, {})
    );
    const periodsByKey = {
      year1: periods[0],
      year2: periods[1],
      year3: periods[2],
    };
    const energyByPeriodByKey = {
      year1: energyByPeriodNormalized[0],
      year2: energyByPeriodNormalized[1],
      year3: energyByPeriodNormalized[2],
    };
    const payload = {
      profile,
      operationalData: periodsByKey,
      energyByPeriod: energyByPeriodByKey,
    };
    fetch('/api/electricity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Request failed');
        }
        return res.json();
      })
      .then(() => {
        window.alert(isCs ? 'Data odeslána. PDF bude doplněno později.' : 'Data submitted. PDF generation will be added later.');
        setShowPdfButton(true);
      })
      .catch(() => {
        window.alert(isCs ? 'Odeslání se nezdařilo. Zkuste to znovu.' : 'Submission failed. Please try again.');
      })
      .finally(() => setIsSubmitting(false));
  };

  const handleGeneratePdf = async () => {
    const selectedProfile = ACCOMMODATION_PROFILES.find((p) => p.id === profile);
    const accommodationProfileLabel = selectedProfile ? (isCs ? selectedProfile.titleCs : selectedProfile.titleEn) : '';
    const pdfData = await buildElectricityPdfData({
      isCs,
      profile,
      periods,
      energyByPeriod,
      yearsForConsumption,
      perPeriodTotals,
      perPeriodIndicators,
      benchmarkValues,
      accommodationProfileLabel,
    });

    await generateElectricityVectorPdf({
      language: isCs ? 'cs' : 'en',
      coverTitle: isCs ? 'Elektřina' : 'Electricity',
      coverColor: [250, 204, 21],
      coverLogoUrl: isCs ? pdfLogoCz : pdfLogoEn,
      coverLogoType: 'PNG',
      ...pdfData,
    });
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
        <div id="pdf-tables">
          <SectionCard className="mb-12" data-pdf-card>
            <div className="mb-12">
              <AccommodationProfileInput value={profile} onChange={setProfile} themeColor="yellow" />
            </div>
            <div className="mb-12">
              <PeriodDataInput data={periods} onChange={setPeriods} themeColor="yellow" />
            </div>
            <div className="mb-12">
              <EnergyByPeriodInput
                periods={periods}
                values={energyByPeriod}
                onChange={setEnergyByPeriod}
              />
            </div>
            <div className="mb-12" data-pdf-hide>
              <EnergyEmissionsInput
                themeColor="yellow"
                values={energyValues}
                onValuesChange={setEnergyValues}
              />
            </div>
          </SectionCard>

          <SectionCard className="mb-12" data-pdf-card>
            <EnergyConsumptionTable
              years={yearsForConsumption}
              denominators={denominatorsForConsumption}
              values={valuesForConsumption}
            />
          </SectionCard>

          <SectionCard className="mb-12" data-pdf-card>
            <EnergyRenewablesSummary
              years={yearsForConsumption}
              values={energyByPeriod}
            />
          </SectionCard>

          <SectionCard className="mb-12" data-pdf-card>
            <BenchmarksThresholdsTable
              years={yearsForConsumption}
              valuesByYear={benchmarkValues}
            />
          </SectionCard>

          <SectionCard className="mb-12" data-pdf-card>
            {periods.slice(0, 3).map((period, idx) => (
              <div key={period.id} className={idx === 0 ? '' : 'mt-12'}>
                <EnergyManagementTable
                  totalEnergyKwh={perPeriodTotals[idx]?.totalEnergy || 0}
                  totalEmissionsKg={perPeriodTotals[idx]?.totalEmissions || 0}
                  floorAreaM2={perPeriodIndicators[idx]?.floorAreaM2 ?? null}
                  roomNights={perPeriodIndicators[idx]?.roomNights ?? null}
                  profileId={profile}
                  periodTitle={
                    isCs
                      ? `Období – ${period.period || '-'}`
                      : `Period – ${period.period || '-'}`
                  }
                />
              </div>
            ))}
          </SectionCard>
        </div>

        <div className="flex justify-center mb-12">
          <div className="flex flex-col items-center gap-4">
            <ConsentRow
              checked={consent}
              onChange={setConsent}
              label={isCs
                ? 'Odesláním souhlasím se zpracováním vložených údajů.'
                : 'By submitting, I agree to the processing of the provided data.'}
              themeColor="yellow"
            />
            <PrimaryButton
              onClick={handleSubmit}
              disabled={isSubmitting || hasInvalidOperatingDays || hasEmptyFields || !consent}
            >
              {isSubmitting ? (isCs ? 'Odesílám...' : 'Submitting...') : (isCs ? 'Odeslat' : 'Submit')}
            </PrimaryButton>
            {showPdfButton && (
              <SecondaryButton onClick={handleGeneratePdf}>
                {isCs ? 'Generovat PDF' : 'Generate PDF'}
              </SecondaryButton>
            )}
            <Link
              to="/electricityaudit"
              className="px-6 py-3 rounded-2xl border border-stone-300 text-stone-900 font-bold uppercase tracking-widest text-sm hover:bg-yellow-400 hover:scale-105 transition-all"
            >
              {isCs ? 'Přejít na Self-Audit elektřiny' : 'Go to Electricity Self-Audit'}
            </Link>
          </div>
        </div>

      </main>
      
    </div>
  );
}




