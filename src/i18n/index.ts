import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      title: 'GreenPack Sustainability Tracker',
      subtitle: 'EU Horizon Project - Hotel Data Collection',
      steps: {
        type: 'Type',
        details: 'Details',
        energy: 'Energy',
        water: 'Water',
        waste: 'Waste',
        review: 'Review'
      },
      fields: {
        name: 'Accommodation Name',
        country: 'Country',
        city: 'City',
        rooms: 'Number of Rooms',
        guests: 'Guests per Year',
        electricity: 'Electricity (kWh/year)',
        gas: 'Gas (kWh/year)',
        renewables: 'Renewable Energy (%)',
        waterTotal: 'Total Water (m³)',
        waterRecycled: 'Recycled Water (%)',
        wasteTotal: 'Total Waste (kg)',
        wasteRecycled: 'Recycled Waste (kg)'
      },
      rating: {
        title: 'Sustainability Rating',
        A: 'Excellent',
        B: 'Good',
        C: 'Average',
        D: 'Below Average',
        E: 'Poor'
      },
      recommendations: {
        rec_high_energy: 'Consider installing LED lighting and motion sensors to reduce energy consumption.',
        rec_high_water: 'Install low-flow showerheads and dual-flush toilets to save water.',
        rec_low_recycling: 'Implement a better waste sorting system for guests and staff.',
        rec_low_renewables: 'Explore options for solar panels or switching to a green energy provider.'
      },
      actions: {
        next: 'Next',
        back: 'Back',
        submit: 'Submit & Generate Report',
        download: 'Download PDF Report',
        restart: 'Start New Submission'
      }
    }
  },
  cs: {
    translation: {
      title: 'GreenPack Sledování Udržitelnosti',
      subtitle: 'Projekt EU Horizon - Sběr dat hotelů',
      steps: {
        type: 'Typ',
        details: 'Detaily',
        energy: 'Energie',
        water: 'Voda',
        waste: 'Odpad',
        review: 'Přehled'
      },
      fields: {
        name: 'Název ubytování',
        country: 'Země',
        city: 'Město',
        rooms: 'Počet pokojů',
        guests: 'Hostů za rok',
        electricity: 'Elektřina (kWh/rok)',
        gas: 'Plyn (kWh/rok)',
        renewables: 'Obnovitelná energie (%)',
        waterTotal: 'Celková voda (m³)',
        waterRecycled: 'Recyklovaná voda (%)',
        wasteTotal: 'Celkový odpad (kg)',
        wasteRecycled: 'Recyklovaný odpad (kg)'
      },
      rating: {
        title: 'Hodnocení udržitelnosti',
        A: 'Vynikající',
        B: 'Dobré',
        C: 'Průměrné',
        D: 'Podprůměrné',
        E: 'Slabé'
      },
      recommendations: {
        rec_high_energy: 'Zvažte instalaci LED osvětlení a pohybových senzorů pro snížení spotřeby energie.',
        rec_high_water: 'Nainstalujte úsporné sprchové hlavice a toalety s dvojitým splachováním.',
        rec_low_recycling: 'Zaveďte lepší systém třídění odpadu pro hosty i personál.',
        rec_low_renewables: 'Prozkoumejte možnosti solárních panelů nebo přechod k dodavateli zelené energie.'
      },
      actions: {
        next: 'Další',
        back: 'Zpět',
        submit: 'Odeslat a vygenerovat zprávu',
        download: 'Stáhnout PDF zprávu',
        restart: 'Začít znovu'
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
