import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Zap,
  Lightbulb,
  Sliders,
  Fan,
  Sun,
  ClipboardCheck,
  PlugZap,
  Wrench,
  Leaf,
  FileText,
  Building,
  Users,
  BedDouble,
  Shirt,
  Radar,
  KeyRound,
  Thermometer,
  DoorClosed,
  MessageSquareText,
  QrCode,
  LineChart,
  ClipboardList,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SelfAuditCard from '../components/SelfAuditCard';
import AccommodationProfileInput from '../components/AccommodationProfileInput';
import selfAuditData from '../data/selfAuditElectricity.json';
import { getSelfAuditRatingLabel, getSelfAuditRatingColorClass } from '../functions/selfAuditRating';

type AuditCard = {
  id: string;
  weight?: number;
  title: { cs: string; en: string };
  description: { cs: string; en: string };
  question?: { cs: string; en: string };
  icon: React.ReactNode;
};

const ICONS: Record<string, React.ReactNode> = {
  lighting: <Lightbulb className="w-10 h-10" />,
  controls: <Sliders className="w-10 h-10" />,
  equipment: <Fan className="w-10 h-10" />,
  renewables: <Sun className="w-10 h-10" />,
  energy_audit: <ClipboardCheck className="w-10 h-10" />,
  led_lighting_replacement: <Lightbulb className="w-10 h-10" />,
  energy_saving_appliances: <PlugZap className="w-10 h-10" />,
  hvac_maintenance: <Wrench className="w-10 h-10" />,
  use_renewable_energy_sources: <Leaf className="w-10 h-10" />,
  purchase_green_electricity: <FileText className="w-10 h-10" />,
  building_energy_insulation: <Building className="w-10 h-10" />,
  employee_training_energy_behavior: <Users className="w-10 h-10" />,
  laundry_towels_on_request: <Shirt className="w-10 h-10" />,
  laundry_bed_linen_frequency: <BedDouble className="w-10 h-10" />,
  lighting_motion_sensors_common_areas: <Radar className="w-10 h-10" />,
  lighting_room_keycard_activators: <KeyRound className="w-10 h-10" />,
  heating_standard_temperature_with_override: <Thermometer className="w-10 h-10" />,
  ac_only_with_closed_windows: <DoorClosed className="w-10 h-10" />,
  guest_behavior_signs_turn_off: <MessageSquareText className="w-10 h-10" />,
  guest_behavior_qr_flyer_info: <QrCode className="w-10 h-10" />,
  management_energy_monitoring_frequency: <LineChart className="w-10 h-10" />,
  management_record_temp_requests_for_prediction: <ClipboardList className="w-10 h-10" />,
};

const CARDS: AuditCard[] = selfAuditData.cards.map((card) => ({
  id: card.id,
  weight: typeof card.weight === 'number' ? card.weight : 1,
  title: card.title,
  description: card.description,
  question: card.question,
  icon: ICONS[card.id] ?? <Zap className="w-10 h-10" />,
}));

export default function SelfAuditElectricity() {
  const { i18n } = useTranslation();
  const isCs = i18n.language === 'cs';
  const [inputs, setInputs] = useState<Record<string, number>>({});
  const [profile, setProfile] = useState('1');
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEvaluation, setShowEvaluation] = useState(false);

  const scores = useMemo(() => {
    return CARDS.reduce<Record<string, number>>((acc, card) => {
      const raw = inputs[card.id];
      const value = typeof raw === 'number' ? raw : 0;
      acc[card.id] = Math.min(100, Math.max(0, Math.round(value)));
      return acc;
    }, {});
  }, [inputs]);

  const totalScore = useMemo(() => {
    let sum = 0;
    let weightSum = 0;
    CARDS.forEach((card) => {
      const w = card.weight ?? 1;
      sum += (scores[card.id] ?? 0) * w;
      weightSum += w;
    });
    if (weightSum === 0) return 0;
    return Math.round(sum / weightSum);
  }, [scores]);

  const handleChange = (id: string, value: number) => {
    const clamped = Math.max(0, Math.min(100, value));
    setInputs((prev) => ({ ...prev, [id]: clamped }));
  };

  const handleSubmit = () => {
    if (!consent) return;
    setIsSubmitting(true);
    setShowEvaluation(true);

    const answers = CARDS.reduce<Record<string, number>>((acc, card) => {
      acc[card.id] = scores[card.id] ?? 0;
      return acc;
    }, {});

    fetch('/api/electricityselfaudit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profile,
        answers,
        totalScore,
        language: isCs ? 'cs' : 'en',
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Request failed');
        }
        return res.json();
      })
      .then(() => {
        window.alert(isCs ? 'Self-Audit odeslán.' : 'Self-Audit submitted.');
      })
      .catch(() => {
        window.alert(isCs ? 'Odeslání se nezdařilo. Zkuste to znovu.' : 'Submission failed. Please try again.');
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <div className="min-h-screen bg-yellow-50/30 font-sans text-stone-900">
      <PageHeader
        title={isCs ? 'Self-Audit elektřiny' : 'Electricity Self-Audit'}
        description={isCs
          ? 'Rychlé zhodnocení úspor a opatření pro váš provoz.'
          : 'Quick assessment of savings and measures for your operation.'}
        icon={<Zap className="w-6 h-6" />}
        themeColor="yellow"
      />

      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="mb-10">
          <AccommodationProfileInput value={profile} onChange={setProfile} themeColor="yellow" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {CARDS.map((card) => (
            <SelfAuditCard
              key={card.id}
              title={isCs ? card.title.cs : card.title.en}
              question={card.question ? (isCs ? card.question.cs : card.question.en) : undefined}
              description={isCs ? card.description.cs : card.description.en}
              value={scores[card.id] ?? 0}
              onChange={(value) => handleChange(card.id, value)}
              ratingLabel={showEvaluation ? getSelfAuditRatingLabel(scores[card.id] ?? null, isCs ? 'cs' : 'en') : ''}
              ratingColorClass={getSelfAuditRatingColorClass(scores[card.id] ?? null)}
              showRatingValueColor={showEvaluation}
              showRating={showEvaluation}
              icon={card.icon}
            />
          ))}
        </div>

        {showEvaluation ? (
          <div className="mt-12 text-center">
            <div className="text-sm text-stone-500">{isCs ? 'Souhrnné skóre' : 'Overall score'}</div>
            <div className="text-3xl font-bold text-stone-900">{totalScore} / 100</div>
            <div className={`mt-2 text-sm font-semibold ${getSelfAuditRatingColorClass(totalScore)}`}>
              {getSelfAuditRatingLabel(totalScore, isCs ? 'cs' : 'en')}
            </div>
          </div>
        ) : null}

        <div className="flex justify-center mt-8">
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
              disabled={!consent || isSubmitting}
              className="px-6 py-3 rounded-2xl bg-yellow-500 text-black font-bold uppercase tracking-widest text-sm shadow-md shadow-yellow-900/10 hover:bg-yellow-400 transition-all disabled:bg-stone-300 disabled:text-black disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (isCs ? 'Vyhodnocuji...' : 'Evaluating...') : (isCs ? 'Vyhodnotit' : 'Evaluate')}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
