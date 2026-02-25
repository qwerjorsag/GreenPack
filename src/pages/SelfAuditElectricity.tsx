import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Zap, Lightbulb, Sliders, Fan, Sun } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SelfAuditCard from '../components/SelfAuditCard';

type AuditCard = {
  id: string;
  titleCs: string;
  titleEn: string;
  descriptionCs: string;
  descriptionEn: string;
  icon: React.ReactNode;
};

const CARDS: AuditCard[] = [
  {
    id: 'lighting',
    titleCs: 'Efektivní osvětlení',
    titleEn: 'Efficient Lighting',
    descriptionCs:
      'Přechod na LED osvětlení a instalace pohybových senzorů může snížit spotřebu energie na svícení až o 70%.',
    descriptionEn:
      'Switching to LED lighting and installing motion sensors can reduce lighting energy consumption by up to 70%.',
    icon: <Lightbulb className="w-10 h-10" />,
  },
  {
    id: 'controls',
    titleCs: 'Řízení spotřeby',
    titleEn: 'Consumption Controls',
    descriptionCs:
      'Zavedení chytrého řízení vytápění a chlazení umožní lépe reagovat na obsazenost a udržet komfort.',
    descriptionEn:
      'Smart heating and cooling controls help respond to occupancy and maintain comfort efficiently.',
    icon: <Sliders className="w-10 h-10" />,
  },
  {
    id: 'equipment',
    titleCs: 'Úsporné vybavení',
    titleEn: 'Efficient Equipment',
    descriptionCs:
      'Moderní spotřebiče s nižší spotřebou snižují dlouhodobé náklady i uhlíkovou stopu.',
    descriptionEn:
      'Modern low-consumption equipment reduces long-term costs and carbon footprint.',
    icon: <Fan className="w-10 h-10" />,
  },
  {
    id: 'renewables',
    titleCs: 'Obnovitelné zdroje',
    titleEn: 'Renewable Sources',
    descriptionCs:
      'Nákup zelené elektřiny nebo instalace panelů zvyšuje podíl obnovitelných zdrojů.',
    descriptionEn:
      'Green electricity procurement or on-site panels increase renewable share.',
    icon: <Sun className="w-10 h-10" />,
  },
];

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
              title={isCs ? card.titleCs : card.titleEn}
              description={isCs ? card.descriptionCs : card.descriptionEn}
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
