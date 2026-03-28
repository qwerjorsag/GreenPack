import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import logoCz from '../../assets/logos/komora-logo-CZ.svg';
import logoEn from '../../assets/logos/hk_cr_logo_aj_colour.png';
import ContactInfo from '../ContactInfo/ContactInfo';
import PartnerLogos from './PartnerLogos';

export default function Footer() {
  const { i18n, t } = useTranslation('common');
  const logoSrc = i18n.language === 'cs' ? logoCz : logoEn;

  return (
    <footer className="w-full border-t border-stone-200">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex justify-center">
          <PartnerLogos className="text-center" />
        </div>
        <div className="mt-10 flex justify-center">
          <ContactInfo compact className="text-center" />
        </div>
        <div className="mt-10 flex flex-col items-center gap-5 text-center">
          <div className="flex flex-wrap justify-center gap-8">
            <a href="#" className="text-stone-400 hover:text-emerald-600 text-xs font-bold uppercase tracking-widest transition-colors">
              {t('footer.privacy')}
            </a>
            <Link to="/methodology" className="text-stone-400 hover:text-emerald-600 text-xs font-bold uppercase tracking-widest transition-colors">
              {t('footer.methodology')}
            </Link>
            <Link to="/contact" className="text-stone-400 hover:text-emerald-600 text-xs font-bold uppercase tracking-widest transition-colors">
              {t('footer.contact')}
            </Link>
          </div>
          <a href="https://www.komora.cz/" className="flex items-center hover:opacity-80 transition-opacity">
            <img
              src={logoSrc}
              alt={t('footer.alt')}
              className="h-10 w-auto object-contain"
            />
          </a>
          <div className="text-stone-400 text-xs font-bold uppercase tracking-widest">
            <div>{t('footer.project')}</div>
            <div>{t('footer.copyright')}</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
