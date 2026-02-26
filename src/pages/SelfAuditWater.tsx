import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Droplets,
  ClipboardCheck,
  Recycle,
  LineChart,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SelfAuditCard from '../components/SelfAuditCard';
import AccommodationProfileInput, { ACCOMMODATION_PROFILES } from '../components/AccommodationProfileInput';
import selfAuditData from '../data/selfAuditWater.json';
import { getSelfAuditRatingLabel, getSelfAuditRatingColorClass } from '../functions/selfAuditRating';
import SelfAuditSummary from '../components/SelfAuditSummary';
import { generateElectricitySelfAuditPdf } from '../functions/generateElectricitySelfAuditPdf';
import { ConsentRow, PrimaryButton, SecondaryButton } from '../components/ui';
import { captureGaugePng } from '../functions/captureGaugePng';
import pdfLogoCz from '../assets/logos/hk_cr_-logo_cz-logo_zakladni_black.png';
import pdfLogoEn from '../assets/logos/hk_cr_logo_aj_black.png';

type AuditCard = {
  id: string;
  weight?: number;
  title: { cs: string; en: string };
  description: { cs: string; en: string };
  question?: { cs: string; en: string };
  icon: React.ReactNode;
};

const ICONS: Record<string, React.ReactNode> = {
  water_leak_detection: <ClipboardCheck className="w-10 h-10" />,
  low_flow_fixtures: <Droplets className="w-10 h-10" />,
  linen_towel_reuse: <Recycle className="w-10 h-10" />,
  water_consumption_tracking: <LineChart className="w-10 h-10" />,
};

const CARDS: AuditCard[] = selfAuditData.cards.map((card) => ({
  id: card.id,
  weight: typeof card.weight === 'number' ? card.weight : 1,
  title: card.title,
  description: card.description,
  question: card.question,
  icon: ICONS[card.id] ?? <Droplets className="w-10 h-10" />,
}));

export default function SelfAuditWater() {
  const { i18n } = useTranslation();
  const isCs = i18n.language === 'cs';
  const [inputs, setInputs] = useState<Record<string, number>>({});
  const [profile, setProfile] = useState('1');
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [showPdfButton, setShowPdfButton] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

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

  const ratingLabel = getSelfAuditRatingLabel(totalScore, isCs ? 'cs' : 'en');

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

    fetch('/api/waterselfaudit', {
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
        setShowPdfButton(true);
      })
      .catch(() => {
        window.alert(isCs ? 'Odeslání se nezdařilo. Zkuste to znovu.' : 'Submission failed. Please try again.');
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <div className="min-h-screen bg-blue-50/30 font-sans text-stone-900">
      <PageHeader
        title={isCs ? 'Self-Audit vody' : 'Water Self-Audit'}
        description={isCs
          ? 'Rychlé zhodnocení spotřeby vody a úsporných opatření.'
          : 'Quick assessment of water use and saving measures.'}
        icon={<Droplets className="w-6 h-6" />}
        themeColor="blue"
      />

      <main className="max-w-5xl mx-auto px-6 py-16 bg-blue-50/90">
        <div className="mb-10">
          <AccommodationProfileInput value={profile} onChange={setProfile} themeColor="blue" />
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
              themeColor="blue"
            />
          ))}
        </div>

        <SelfAuditSummary score={totalScore} ratingLabel={ratingLabel} show={showEvaluation} />

        <div className="flex justify-center mt-8">
          <div className="flex flex-col items-center gap-4">
            <ConsentRow
              checked={consent}
              onChange={setConsent}
              label={isCs
                ? 'Odesláním souhlasím se zpracováním vložených údajů.'
                : 'By submitting, I agree to the processing of the provided data.'}
              themeColor="blue"
            />
            <PrimaryButton onClick={handleSubmit} disabled={!consent || isSubmitting} themeColor="blue">
              {isSubmitting ? (isCs ? 'Vyhodnocuji...' : 'Evaluating...') : (isCs ? 'Vyhodnotit a stáhnout PDF' : 'Evaluate and download PDF')}
            </PrimaryButton>
            {showPdfButton ? (
              <SecondaryButton
                onClick={async () => {
                  const selectedProfile = ACCOMMODATION_PROFILES.find((p) => p.id === profile);
                  const accommodationProfileLabel = selectedProfile ? (isCs ? selectedProfile.titleCs : selectedProfile.titleEn) : undefined;
                  const gaugeImage = await captureGaugePng({
                    elementId: 'self-audit-gauge',
                    score: totalScore,
                    ratingLabel,
                  }).catch(() => undefined);
                  await generateElectricitySelfAuditPdf({
                    language: isCs ? 'cs' : 'en',
                    coverColor: [147, 197, 253],
                    coverLogoUrl: isCs ? pdfLogoCz : pdfLogoEn,
                    coverLogoType: 'PNG',
                    title: isCs ? 'Self-Audit vody' : 'Water Self-Audit',
                    accommodationProfileLabel,
                    gaugeImage,
                    cards: CARDS.map((card) => ({
                      title: isCs ? card.title.cs : card.title.en,
                      question: card.question ? (isCs ? card.question.cs : card.question.en) : undefined,
                      description: isCs ? card.description.cs : card.description.en,
                      score: scores[card.id] ?? 0,
                      ratingLabel: getSelfAuditRatingLabel(scores[card.id] ?? null, isCs ? 'cs' : 'en'),
                    })),
                    totalScore,
                    totalRatingLabel: ratingLabel,
                  });
                }}
              >
                {isCs ? 'Generovat PDF' : 'Generate PDF'}
              </SecondaryButton>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
