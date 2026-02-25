import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Lightbulb, Wind, Zap } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import AccommodationProfileInput from '../components/AccommodationProfileInput';
import PeriodDataInput, { PeriodData } from '../components/PeriodDataInput';
import EnergyEmissionsInput, { ENERGY_SOURCES } from '../components/EnergyEmissionsInput';
import EnergyManagementTable from '../components/EnergyManagementTable';
import EnergyByPeriodInput from '../components/EnergyByPeriodInput';
import EnergyConsumptionTable from '../components/EnergyConsumptionTable';
import EnergyRenewablesSummary from '../components/EnergyRenewablesSummary';
import BenchmarksThresholdsTable, { IndicatorKey } from '../components/BenchmarksThresholdsTable';
import { generatePdf } from '../functions/generatePdf';

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

  const perPeriodTotals = useMemo(() => {
    return periods.slice(0, 3).map((_, idx) => {
      const valuesForPeriod = energyByPeriod[idx] || {};
      const totalEnergy = ENERGY_SOURCES.reduce((sum, source) => {
        const val = valuesForPeriod[source.id];
        return sum + (typeof val === 'number' ? val : 0);
      }, 0);
      const totalEmissions = ENERGY_SOURCES.reduce((sum, source) => {
        const val = valuesForPeriod[source.id];
        const kwh = typeof val === 'number' ? val : 0;
        return sum + kwh * source.ef;
      }, 0);
      return { totalEnergy, totalEmissions };
    });
  }, [energyByPeriod, periods]);

  const perPeriodIndicators = periods.slice(0, 3).map((period) => {
    const roomNights =
      typeof period.occupancyRate === 'number' &&
      typeof period.operatingDays === 'number' &&
      typeof period.rooms === 'number'
        ? (period.occupancyRate / 100) * period.operatingDays * period.rooms
        : null;
    const floorAreaM2 = typeof period.floorArea === 'number' ? period.floorArea : null;
    return { roomNights, floorAreaM2 };
  });

  const benchmarkValues = useMemo(() => {
    const valuesByYear: Record<IndicatorKey, Array<number | null>> = {
      energyIntensityM2: [],
      energyIntensityRoomNight: [],
      emissionsIntensityM2: [],
      emissionsIntensityRoomNight: [],
      renewableShare: [],
    };

    periods.slice(0, 3).forEach((_, idx) => {
      const totalEnergy = perPeriodTotals[idx]?.totalEnergy ?? 0;
      const totalEmissions = perPeriodTotals[idx]?.totalEmissions ?? 0;
      const floorArea = perPeriodIndicators[idx]?.floorAreaM2 ?? null;
      const roomNights = perPeriodIndicators[idx]?.roomNights ?? null;
      const energyIntensityM2 = floorArea && floorArea > 0 ? totalEnergy / floorArea : null;
      const energyIntensityRoomNight = roomNights && roomNights > 0 ? totalEnergy / roomNights : null;
      const emissionsIntensityM2 = floorArea && floorArea > 0 ? totalEmissions / floorArea : null;
      const emissionsIntensityRoomNight = roomNights && roomNights > 0 ? totalEmissions / roomNights : null;

      const periodValues = energyByPeriod[idx] || {};
      const totalKwh = Object.values(periodValues).reduce((sum, v) => sum + (typeof v === 'number' ? v : 0), 0);
      const renewableKwh = typeof periodValues.electricity_renewable === 'number' ? periodValues.electricity_renewable : 0;
      const renewableShare = totalKwh > 0 ? (renewableKwh / totalKwh) * 100 : null;

      valuesByYear.energyIntensityM2.push(energyIntensityM2);
      valuesByYear.energyIntensityRoomNight.push(energyIntensityRoomNight);
      valuesByYear.emissionsIntensityM2.push(emissionsIntensityM2);
      valuesByYear.emissionsIntensityRoomNight.push(emissionsIntensityRoomNight);
      valuesByYear.renewableShare.push(renewableShare);
    });

    return valuesByYear;
  }, [periods, perPeriodTotals, perPeriodIndicators, energyByPeriod]);

  const yearsForConsumption = periods.slice(0, 3).map((p, idx) => {
    const parsed = parseInt(p.period || '', 10);
    if (!Number.isNaN(parsed)) return parsed;
    const base = new Date().getFullYear();
    return base + idx;
  });

  const denominatorsForConsumption = yearsForConsumption.reduce<Record<number, { roomNights: number | null; floorAreaM2: number | null }>>(
    (acc, year, idx) => {
      acc[year] = {
        roomNights: perPeriodIndicators[idx]?.roomNights ?? null,
        floorAreaM2: perPeriodIndicators[idx]?.floorAreaM2 ?? null,
      };
      return acc;
    },
    {}
  );

  const valuesForConsumption = useMemo(() => {
    const base: Record<string, Record<number, number | null>> = {
      'total-energy': {},
      'total-energy-alt': {},
    };
    yearsForConsumption.forEach((year, idx) => {
      const total = perPeriodTotals[idx]?.totalEnergy ?? null;
      base['total-energy'][year] = total;
      base['total-energy-alt'][year] = total;
    });
    return base;
  }, [yearsForConsumption, perPeriodTotals]);

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
    await generatePdf({
      targetId: 'pdf-tables',
      filename: isCs ? 'greenpack-report.pdf' : 'greenpack-report.pdf',
      onMissingTarget: () => {
        window.alert(isCs ? 'PDF sekce nebyla nalezena.' : 'PDF section not found.');
      },
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
          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-stone-200 mb-12" data-pdf-card>
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
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-stone-200 mb-12" data-pdf-card>
            <EnergyConsumptionTable
              years={yearsForConsumption}
              denominators={denominatorsForConsumption}
              values={valuesForConsumption}
            />
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-stone-200 mb-12" data-pdf-card>
            <EnergyRenewablesSummary
              years={yearsForConsumption}
              values={energyByPeriod}
            />
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-stone-200 mb-12" data-pdf-card>
            <BenchmarksThresholdsTable
              years={yearsForConsumption}
              valuesByYear={benchmarkValues}
            />
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-stone-200 mb-12" data-pdf-card>
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
            <label className="flex items-center gap-3 text-sm text-stone-700">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="h-4 w-4 rounded border-stone-300 accent-yellow-500 focus:ring-yellow-400"
              />
              {isCs
                ? 'Odesláním souhlasím se zpracováním vložených údajů.'
                : 'By submitting, I agree to the processing of the provided data.'}
            </label>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || hasInvalidOperatingDays || hasEmptyFields || !consent}
              className="px-6 py-3 rounded-2xl bg-yellow-500 text-black font-bold uppercase tracking-widest text-sm shadow-md shadow-yellow-900/10 hover:bg-yellow-400 transition-all disabled:bg-stone-300 disabled:text-black disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (isCs ? 'Odesílám...' : 'Submitting...') : (isCs ? 'Odeslat' : 'Submit')}
            </button>
            {showPdfButton && (
              <button
                type="button"
                onClick={handleGeneratePdf}
                className="px-6 py-3 rounded-2xl bg-stone-900 text-white font-bold uppercase tracking-widest text-sm shadow-md hover:bg-stone-800 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
              >
                {isCs ? 'Generovat PDF' : 'Generate PDF'}
              </button>
            )}
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

      </main>
      
    </div>
  );
}
