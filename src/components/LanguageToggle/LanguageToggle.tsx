import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export default function LanguageToggle() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const next = i18n.language === 'en' ? 'cs' : 'en';
    i18n.changeLanguage(next);
  };

  return (
    <button 
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white/20 transition-colors text-white"
    >
      <Globe className="w-4 h-4" />
      {i18n.language}
    </button>
  );
}
