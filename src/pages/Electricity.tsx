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
import ElectricitySummaryCard from '../components/ElectricitySummaryCard';
import { generateElectricityVectorPdf } from '../functions/generateElectricityVectorPdf';
import { ConsentRow, PrimaryButton, PdfDownloadModal } from '../components/ui';
import { useElectricityDerived } from '../hooks/useElectricityDerived';
import { useElectricityValidation } from '../hooks/useElectricityValidation';
import { buildElectricityPdfData } from '../functions/buildElectricityPdfData';
import pdfLogoCz from '../assets/logos/hk_cr_-logo_cz-logo_zakladni_black.png';
import pdfLogoEn from '../assets/logos/hk_cr_logo_aj_black.png';

export default function Electricity() {
  const { i18n } = useTranslation();
  const isCs = i18n.language === 'cs';

  const [profile, setProfile] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pdfDownloaded, setPdfDownloaded] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
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
  const missingProfile = !profile;
  const missingConsent = !consent;
  const electricityDisabled = pdfDownloaded || isSubmitting || hasInvalidOperatingDays || hasEmptyFields || missingConsent || missingProfile;
  const electricityTooltip = isCs
    ? missingProfile
      ? 'Vyberte profil ubytování.'
      : hasInvalidOperatingDays
        ? 'Rok má max 365 dnů.'
        : hasEmptyFields
          ? 'Vyplňte všechna pole v tabulkách: Provozní údaje a ENERGIE (kWh).'
          : missingConsent
            ? 'Je nutné souhlasit se zpracováním údajů.'
            : ''
    : missingProfile
      ? 'Please select an accommodation profile.'
      : hasInvalidOperatingDays
        ? 'The year has a maximum of 365 days.'
        : hasEmptyFields
          ? 'Please complete all fields in the tables: Operational Data and ENERGY (kWh).'
          : missingConsent
            ? 'You must agree to data processing.'
            : '';

  const {
    perPeriodTotals,
    perPeriodIndicators,
    benchmarkValues,
    yearsForConsumption,
    denominatorsForConsumption,
    valuesForConsumption,
  } = useElectricityDerived(periods, energyByPeriod);

  const totalEnergyKwh = perPeriodTotals.reduce((sum, p) => sum + (p?.totalEnergy ?? 0), 0);
  const totalRenewableKwh = energyByPeriod.reduce((sum, periodValues) => {
    const val = periodValues?.electricity_renewable;
    return sum + (typeof val === 'number' ? val : 0);
  }, 0);
  const renewableShare = totalEnergyKwh > 0 ? (totalRenewableKwh / totalEnergyKwh) * 100 : 0;
  const totalRoomNights = periods.reduce((sum, p) => {
    const occ = typeof p.occupancyRate === 'number' ? p.occupancyRate : 0;
    const days = typeof p.operatingDays === 'number' ? p.operatingDays : 0;
    const rooms = typeof p.rooms === 'number' ? p.rooms : 0;
    return sum + (occ / 100) * days * rooms;
  }, 0);
  const perRoomNightKwh = totalRoomNights > 0 ? totalEnergyKwh / totalRoomNights : 0;


  const handleSubmit = async () => {
    if (hasInvalidOperatingDays || hasEmptyFields || !profile) return;
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
    try {
      const res = await fetch('/api/electricity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Request failed');
      }
      await res.json().catch(() => ({}));
      setShowPdfModal(true);
    } catch (err) {
      window.alert(isCs ? 'Odeslání se nezdařilo. Zkuste to znovu.' : 'Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
    setPdfDownloaded(true);
    setShowPdfModal(false);
  };

  return (
    <div className="min-h-screen bg-yellow-400/10 font-sans text-stone-900">
      <PageHeader 
        title={isCs ? 'Elektřina' : 'Electricity'}
        description={isCs
          ? 'Energie je jedním z největších nákladů i dopadů na životní prostředí v ubytovacím sektoru. Zjistěte si Vaši hospodárnost.'
          : 'Energy is one of the largest costs and environmental impacts in the accommodation sector.'}
        icon={<Zap className="w-6 h-6" />}
        themeColor="yellow"
        titleClassName="!text-black"
      />

      <main className="max-w-5xl mx-auto px-3 md:px-6 py-16 bg-transparent">
        <div id="pdf-tables">
          <div className="gp-card">
            <div className="mb-12">
              <AccommodationProfileInput value={profile} onChange={setProfile} themeColor="yellow" />
            </div>
              <PeriodDataInput data={periods} onChange={setPeriods} themeColor="yellow" />
          </div>

          <div className="gp-card" data-pdf-card>
            <div className="mb-12">
              <EnergyByPeriodInput
                periods={periods}
                values={energyByPeriod}
                onChange={setEnergyByPeriod}
              />
            </div>
            {/*<div className="mb-12" data-pdf-hide>*/}
            {/*  <EnergyEmissionsInput*/}
            {/*    themeColor="yellow"*/}
            {/*    values={energyValues}*/}
            {/*    onValuesChange={setEnergyValues}*/}
            {/*  />*/}
            {/*</div>*/}
          </div>

          <ElectricitySummaryCard
            isCs={isCs}
            totalEnergyKwh={totalEnergyKwh}
            renewableShare={renewableShare}
            perRoomNightKwh={perRoomNightKwh}
          />

          <div className="gp-card" data-pdf-card>
            <EnergyConsumptionTable
              years={yearsForConsumption}
              denominators={denominatorsForConsumption}
              values={valuesForConsumption}
            />
          </div>

          <div className="gp-card" data-pdf-card>
            <EnergyRenewablesSummary
              years={yearsForConsumption}
              values={energyByPeriod}
            />
          </div>

          <div className="gp-card" data-pdf-card>
            <BenchmarksThresholdsTable
              years={yearsForConsumption}
              valuesByYear={benchmarkValues}
              ratingMatrixSource="electricity"
            />
          </div>

          <div className="gp-card" data-pdf-card>
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
          </div>
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
            <span className="group relative inline-block">
              <PrimaryButton
                onClick={handleSubmit}
                disabled={electricityDisabled}
              >
                {pdfDownloaded
                  ? (isCs ? 'PDF staženo' : 'PDF downloaded')
                  : isSubmitting
                    ? (isCs ? 'Generuji...' : 'Generating...')
                    : (isCs ? 'Generovat PDF' : 'Generate PDF')}
              </PrimaryButton>
              {electricityDisabled && !pdfDownloaded && (
                <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-3 w-72 -translate-x-1/2 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-stone-700 shadow-lg opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  {electricityTooltip}
                </div>
              )}
            </span>
            <Link
              to="/electricityaudit"
              className="mt-6 px-6 py-3 rounded-2xl border border-stone-300 text-stone-900 font-bold uppercase tracking-widest text-sm hover:bg-yellow-400 hover:scale-105 transition-all"
            >
              {isCs ? 'Přejít na Self-Audit elektřiny' : 'Go to Electricity Self-Audit'}
            </Link>
          </div>
        </div>

        <PdfDownloadModal
          open={showPdfModal}
          onClose={() => setShowPdfModal(false)}
          onDownload={handleGeneratePdf}
          title={isCs ? 'Stáhnout PDF' : 'Download PDF'}
          description={isCs
            ? 'Data byla úspěšně odeslána. Nyní si můžete stáhnout PDF report.'
            : 'Your data has been submitted. You can now download the PDF report.'}
          downloadLabel={isCs ? 'Stáhnout PDF' : 'Download PDF'}
          closeLabel={isCs ? 'Zavřít' : 'Close'}
        />
      </main>
      
    </div>
  );
}




