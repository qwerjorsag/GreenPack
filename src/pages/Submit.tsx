import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ChevronLeft, 
  Send,
  Building2,
  Mail,
  User
} from 'lucide-react';
import '../i18n';
import AccommodationTypeSelect from '../components/AccommodationTypeSelect';

export default function Submit() {
  const { t, i18n } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [accommodationType, setAccommodationType] = useState('hotel');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1500);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-emerald-50/50 flex items-center justify-center p-6 font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-[2.5rem] shadow-xl p-12 text-center border border-emerald-100"
        >
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <Send className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-stone-900 mb-4">
            {i18n.language === 'cs' ? 'Děkujeme!' : 'Thank You!'}
          </h1>
          <p className="text-stone-500 mb-8 leading-relaxed">
            {i18n.language === 'cs' 
              ? 'Vaše data byla úspěšně odeslána. Budeme vás brzy kontaktovat.' 
              : 'Your data has been successfully submitted. We will contact you soon.'}
          </p>
          <Link 
            to="/"
            className="inline-block w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/10"
          >
            {i18n.language === 'cs' ? 'Zpět na úvod' : 'Back to Home'}
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-50/50 font-sans text-stone-900">
      <main className="max-w-2xl mx-auto px-6 py-12 pb-24">
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-emerald-100 p-12">
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">GreenPack</h1>
          <p className="text-stone-400 font-medium uppercase tracking-widest text-xs mb-12">
            {i18n.language === 'cs' ? 'Registrační formulář' : 'Registration Form'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AccommodationTypeSelect 
              value={accommodationType} 
              onChange={setAccommodationType} 
            />

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-3 flex items-center gap-2">
                <Building2 className="w-3 h-3" />
                {i18n.language === 'cs' ? 'Název ubytování' : 'Accommodation Name'}
              </label>
              <input 
                required
                type="text" 
                className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                placeholder={i18n.language === 'cs' ? 'Např. Hotel Green' : 'e.g. Green Hotel'}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-3 flex items-center gap-2">
                <User className="w-3 h-3" />
                {i18n.language === 'cs' ? 'Kontaktní osoba' : 'Contact Person'}
              </label>
              <input 
                required
                type="text" 
                className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-3 flex items-center gap-2">
                <Mail className="w-3 h-3" />
                Email
              </label>
              <input 
                required
                type="email" 
                className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-900/20 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {isSubmitting 
                  ? (i18n.language === 'cs' ? 'Odesílám...' : 'Sending...') 
                  : (i18n.language === 'cs' ? 'Odeslat registraci' : 'Submit Registration')}
                {!isSubmitting && <Send className="w-4 h-4" />}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
