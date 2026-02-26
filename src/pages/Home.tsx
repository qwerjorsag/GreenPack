import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Zap, Droplets, Trash2, ChevronRight } from 'lucide-react';

export default function Home() {
  const { t, i18n } = useTranslation();

  const tiles = [
    {
      id: 'electricity',
      title: i18n.language === 'cs' ? 'Elektřina' : 'Electricity',
      description: i18n.language === 'cs' ? 'Sledování spotřeby energie a obnovitelných zdrojů.' : 'Track energy consumption and renewable sources.',
      icon: <Zap className="w-8 h-8 text-amber-600 group-hover:text-amber-700 transition-colors" />,
      path: '/electricity',
      color: 'bg-amber-50',
      hoverBorder: 'hover:border-amber-500',
      hoverShadow: 'hover:shadow-amber-900/10',
      ctaText: 'text-amber-700'
    },
    {
      id: 'water',
      title: i18n.language === 'cs' ? 'Voda' : 'Water',
      description: i18n.language === 'cs' ? 'Analýza spotřeby vody a recyklace.' : 'Analyze water usage and recycling.',
      icon: <Droplets className="w-8 h-8 text-blue-600 group-hover:text-blue-700 transition-colors" />,
      path: '/water',
      color: 'bg-blue-50',
      hoverBorder: 'hover:border-blue-500',
      hoverShadow: 'hover:shadow-blue-900/10',
      ctaText: 'text-blue-600'
    },
    {
      id: 'waste',
      title: i18n.language === 'cs' ? 'Odpad' : 'Waste',
      description: i18n.language === 'cs' ? 'Správa odpadu a efektivita recyklace.' : 'Waste management and recycling efficiency.',
      icon: <Trash2 className="w-8 h-8 text-stone-700 group-hover:text-stone-800 transition-colors" />,
      path: '/waste',
      color: 'bg-stone-100',
      hoverBorder: 'hover:border-stone-500',
      hoverShadow: 'hover:shadow-stone-900/10',
      ctaText: 'text-stone-700'
    },
    {
      id: 'self-audit-electricity',
      title: i18n.language === 'cs' ? 'Self-Audit elektřiny' : 'Electricity Self-Audit',
      description: i18n.language === 'cs' ? 'Rychlé zhodnocení úspor a opatření pro váš provoz.' : 'Quick assessment of savings and measures for your operation.',
      icon: <Zap className="w-8 h-8 text-amber-600 group-hover:text-amber-700 transition-colors" />,
      path: '/electricityaudit',
      color: 'bg-amber-50',
      hoverBorder: 'hover:border-amber-500',
      hoverShadow: 'hover:shadow-amber-900/10',
      ctaText: 'text-amber-700'
    },
    {
      id: 'self-audit-water',
      title: i18n.language === 'cs' ? 'Self-Audit vody' : 'Water Self-Audit',
      description: i18n.language === 'cs' ? 'Rychlé zhodnocení spotřeby vody a úsporných opatření.' : 'Quick assessment of water use and saving measures.',
      icon: <Droplets className="w-8 h-8 text-blue-600 group-hover:text-blue-700 transition-colors" />,
      path: '/wateraudit',
      color: 'bg-blue-50',
      hoverBorder: 'hover:border-blue-500',
      hoverShadow: 'hover:shadow-blue-900/10',
      ctaText: 'text-blue-600'
    },
    {
      id: 'self-audit-waste',
      title: i18n.language === 'cs' ? 'Self-Audit odpadu' : 'Waste Self-Audit',
      description: i18n.language === 'cs' ? 'Rychlé zhodnocení třídění a prevence odpadu.' : 'Quick assessment of waste sorting and prevention.',
      icon: <Trash2 className="w-8 h-8 text-stone-700 group-hover:text-stone-800 transition-colors" />,
      path: '/wasteaudit',
      color: 'bg-stone-100',
      hoverBorder: 'hover:border-stone-500',
      hoverShadow: 'hover:shadow-stone-900/10',
      ctaText: 'text-stone-700'
    }
  ];

  return (
    <div className="min-h-screen bg-emerald-50/50 font-sans text-stone-900">
      {/* Hero Section */}
      <header className="relative overflow-hidden bg-emerald-900 text-white pt-24 pb-32 px-6">
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
           <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-emerald-400 rounded-full blur-[120px]"></div>
           <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500 rounded-full blur-[100px]"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex justify-between items-start mb-12">
            <div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-6xl font-black tracking-tighter uppercase mb-4"
              >
                GreenPack
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-emerald-200 font-medium uppercase tracking-widest text-sm"
              >
                {t('subtitle')}
              </motion.p>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl"
          >
            <h2 className="text-4xl font-bold mb-6 leading-tight">
              {i18n.language === 'cs' 
                ? 'Budoucnost ubytování je v udržitelnosti.' 
                : 'The future of accommodation is in sustainability.'}
            </h2>
            <p className="text-emerald-100 text-lg mb-8 opacity-80">
              {i18n.language === 'cs'
                ? 'Zmapujte energetickou náročnost svého ubytovacího zařízení a identifikujte prostor pro zlepšení.'
                : 'Map your sustainability and discover room for improvement.'}
            </p>
          </motion.div>
        </div>
      </header>

      {/* Tiles Section */}
      <section className="max-w-6xl mx-auto px-6 -mt-16 relative z-20 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiles.map((tile, idx) => (
            <motion.div
              key={tile.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
            >
              <Link 
                to={tile.path}
                className={`group block h-full bg-white rounded-[2.5rem] p-10 shadow-sm border border-stone-200 hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 ${tile.hoverBorder} ${tile.hoverShadow}`}
              >
                <div className={`w-16 h-16 ${tile.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  {tile.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3">{tile.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed mb-6">
                  {tile.description}
                </p>
                <div className={`flex items-center gap-2 font-bold text-sm uppercase tracking-widest ${tile.ctaText}`}>
                  {i18n.language === 'cs' ? 'Více informací' : 'Learn More'}
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

    </div>
  );
}
