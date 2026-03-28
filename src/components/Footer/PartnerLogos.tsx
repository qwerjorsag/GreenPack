import React from 'react';
import { useTranslation } from 'react-i18next';
import czuLogo from '../../assets/logos/CZU_PEF_barva_RGB.png';
import euLogo from '../../assets/logos/EN_FundedbytheEU_RGB_Monochrome.png';
import komoraLogo from '../../assets/logos/komora-logo-CZ.svg';

type Props = {
  className?: string;
};

const partnerItems = [
  { src: komoraLogo, href: 'https://www.komora.cz/' },
  { src: euLogo, href: 'https://www.interreg-central.eu/projects/greenpact/' },
  { src: czuLogo, href: 'https://pef.czu.cz/' },
];

export default function PartnerLogos({ className }: Props) {
  const { t } = useTranslation('common');
  const slots = Array.from({ length: 3 }, (_, index) => partnerItems[index] ?? null);

  return (
    <div className={className}>
      <div className="font-bold uppercase tracking-widest text-stone-500 text-xs">
        {t('partners.title')}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-6 justify-items-center">
        {slots.map((item, index) => (
          <a
            key={`partner-slot-${index}`}
            href={item?.href ?? '#'}
            className="flex h-16 items-center justify-center"
            aria-label={t('partners.logoAlt', { index: index + 1 })}
          >
            <img
              src={item?.src ?? komoraLogo}
              alt={t('partners.logoAlt', { index: index + 1 })}
              className="max-h-10 w-auto object-contain grayscale opacity-70 transition-all duration-200 hover:grayscale-0 hover:opacity-100 hover:scale-105"
            />
          </a>
        ))}
      </div>
    </div>
  );
}
