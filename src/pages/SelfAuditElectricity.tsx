import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Zap, Lightbulb, Sliders, Fan, Sun } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SelfAuditCard from '../components/SelfAuditCard';
import selfAuditData from '../data/selfAuditElectricity.json';

type AuditCard = {
  id: string;
  title: { cs: string; en: string };
  description: { cs: string; en: string };
  icon: React.ReactNode;
};

const ICONS: Record<string, React.ReactNode> = {
  lighting: <Lightbulb className="w-10 h-10" />,
  controls: <Sliders className="w-10 h-10" />,
  equipment: <Fan className="w-10 h-10" />,
  renewables: <Sun className="w-10 h-10" />,
};

const CARDS: AuditCard[] = selfAuditData.cards.map((card) => ({
  id: card.id,
  title: card.title,
  description: card.description,
  icon: ICONS[card.id] ?? <Zap className="w-10 h-10" />,
}));

export default function SelfAuditElectricity() {
  const { i18n } = useTranslation();
  const isCs = i18n.language === 'cs';
  const [inputs, setInputs] = useState<Record<string, number | ''>>({});

  const scores = useMemo(() => {
    return CARDS.reduce<Record<string, number>>((acc, card) => {
      const raw = inputs[card.id];
      const value = typeof raw === 'number' ? raw : 0;
      acc[card.id] = Math.min(100, Math.max(0, Math.round(value)));
      return acc;
    }, {});
  }, [inputs]);

  const handleChange = (id: string, value: string) => {
    if (value === '') {
      setInputs((prev) => ({ ...prev, [id]: '' }));
      return;
    }
    const num = Number(value.replace(/\s/g, '').replace(',', '.'));
    if (!Number.isNaN(num)) {
      const clamped = Math.max(0, Math.min(100, num));
      setInputs((prev) => ({ ...prev, [id]: clamped }));
    }
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {CARDS.map((card) => (
            <SelfAuditCard
              key={card.id}
              title={isCs ? card.title.cs : card.title.en}
              description={isCs ? card.description.cs : card.description.en}
              value={inputs[card.id] ?? ''}
              onChange={(value) => handleChange(card.id, value)}
              score={scores[card.id] ?? 0}
              icon={card.icon}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
