import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import clsx from 'clsx';

type Props = {
  textClassName?: string;
  borderClassName?: string;
  hoverClassName?: string;
  className?: string;
};

export default function LanguageSwitch({
  textClassName,
  borderClassName,
  hoverClassName,
  className,
}: Props) {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const next = i18n.language === 'en' ? 'cs' : 'en';
    i18n.changeLanguage(next);
  };

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className={clsx(
        'flex items-center gap-2 px-4 py-2 border rounded-full text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer',
        textClassName,
        borderClassName,
        hoverClassName,
        className
      )}
    >
      <Globe className="w-4 h-4" />
      {i18n.language}
    </button>
  );
}
