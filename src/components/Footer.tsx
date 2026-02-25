import React from 'react';
import { useTranslation } from 'react-i18next';
import logoCz from '../assets/logos/komora-logo-CZ.svg';
import logoEn from '../assets/logos/hk_cr_logo_aj_colour.png';

export default function Footer() {
  const { i18n } = useTranslation();
  const logoSrc = i18n.language === 'cs' ? logoCz : logoEn;

  return (
    <footer className="max-w-6xl mx-auto px-6 py-12 border-t border-stone-200">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <a href="https://www.komora.cz/" className="flex items-center hover:opacity-80 transition-opacity">
            <img
              src={logoSrc}
              alt="Hospodářská komora"
              className="h-10 w-auto object-contain"
            />
          </a>
          <div className="text-stone-400 text-xs font-bold uppercase tracking-widest">
            © 2026 Projekt Hospodářské komory
          </div>
        </div>
        <div className="flex gap-8">
          <a href="#" className="text-stone-400 hover:text-emerald-600 text-xs font-bold uppercase tracking-widest transition-colors">Privacy</a>
          <a href="#" className="text-stone-400 hover:text-emerald-600 text-xs font-bold uppercase tracking-widest transition-colors">Methodology</a>
          <a href="#" className="text-stone-400 hover:text-emerald-600 text-xs font-bold uppercase tracking-widest transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
}

