import React from 'react';
import { useTranslation } from 'react-i18next';
import { Phone, Mail, Inbox } from 'lucide-react';

type Props = {
  className?: string;
  compact?: boolean;
};

export default function ContactInfo({ className, compact }: Props) {
  const { t } = useTranslation('common');
  const addressLinesRaw = t('contactInfo.addressLines', { returnObjects: true });
  const addressLines = Array.isArray(addressLinesRaw) ? addressLinesRaw : [String(addressLinesRaw)];

  const textClass = compact ? 'text-xs' : 'text-base';
  const titleClass = compact ? 'text-xs' : 'text-sm';
  const iconClass = 'w-6 h-6';

  return (
    <div className={className}>
      <div className={`text-center font-bold uppercase tracking-widest text-stone-500 ${titleClass}`}>
        {t('contactInfo.title')}
      </div>
      <div className={`mt-4 grid gap-6 text-stone-700 ${textClass} lg:grid-cols-2`}>
        <div className="text-center lg:text-left">
          <div className="font-semibold text-stone-900">{t('contactInfo.orgName')}</div>
          {addressLines.map((line, idx) => (
            <div key={`${line}-${idx}`}>{line}</div>
          ))}
        </div>
        <div className="space-y-1 text-center lg:text-left">
          <div>{t('contactInfo.companyId.label')}: {t('contactInfo.companyId.value')}</div>
          <div>{t('contactInfo.vatId.label')}: {t('contactInfo.vatId.value')}</div>
          <div>{t('contactInfo.registration')}</div>
          <div>{t('contactInfo.fileNumber.label')}: {t('contactInfo.fileNumber.value')}</div>
        </div>
        <div className="space-y-2 text-center lg:text-left lg:col-span-2">
          <div className="flex items-center justify-center gap-3 lg:justify-start">
            <Phone className={iconClass} />
            <a
              href={`tel:${t('contactInfo.phone')}`}
              className="hover:text-emerald-700 transition-colors"
            >
              {t('contactInfo.phone')}
            </a>
          </div>
          <div className="flex items-center justify-center gap-3 lg:justify-start">
            <Mail className={iconClass} />
            <a
              href={`mailto:${t('contactInfo.email')}`}
              className="hover:text-emerald-700 transition-colors"
            >
              {t('contactInfo.email')}
            </a>
          </div>
          <div className="flex items-center justify-center gap-3 lg:justify-start">
            <Inbox className={iconClass} />
            <span>{t('contactInfo.dataBox.label')}: {t('contactInfo.dataBox.value')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
