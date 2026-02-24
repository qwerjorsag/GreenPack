import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      subtitle: 'Chamber of Commerce project',
      fields: {
        energyElectricity: 'Electricity consumption (kWh)',
        energyGas: 'Gas consumption (kWh)',
        energyRenewable: 'Renewable energy (%)',
        waterTotal: 'Total water consumption (m³)',
        waterRecycled: 'Recycled water (%)',
        wasteTotal: 'Total waste (kg)',
        wasteRecycled: 'Recycled waste (kg)',
      },
      recommendations: {
        rec_high_energy: 'Reduce energy consumption by upgrading insulation and installing LED lighting.',
        rec_high_water: 'Install water-saving fixtures and consider rainwater harvesting.',
        rec_low_recycling: 'Improve waste sorting and recycling practices.',
        rec_low_renewables: 'Increase share of renewable energy sources or purchase green energy.',
      }
    }
  },
  cs: {
    translation: {
      subtitle: 'Projekt Hospodářské komory',
      fields: {
        energyElectricity: 'Spotřeba elektřiny (kWh)',
        energyGas: 'Spotřeba plynu (kWh)',
        energyRenewable: 'Obnovitelná energie (%)',
        waterTotal: 'Celková spotřeba vody (m³)',
        waterRecycled: 'Recyklovaná voda (%)',
        wasteTotal: 'Celkový odpad (kg)',
        wasteRecycled: 'Recyklovaný odpad (kg)',
      },
      recommendations: {
        rec_high_energy: 'Snižte spotřebu energie zlepšením izolace a instalací LED osvětlení.',
        rec_high_water: 'Nainstalujte úsporné armatury a zvažte sběr dešťové vody.',
        rec_low_recycling: 'Zlepšete třídění odpadu a recyklaci.',
        rec_low_renewables: 'Zvyšte podíl obnovitelných zdrojů energie nebo nakupujte zelenou energii.',
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'cs',
    fallbackLng: 'cs',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;