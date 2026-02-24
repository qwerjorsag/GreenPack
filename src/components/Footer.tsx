import React from 'react';

export default function Footer() {
  return (
    <footer className="max-w-6xl mx-auto px-6 py-12 border-t border-stone-200">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-stone-400 text-xs font-bold uppercase tracking-widest">
          © 2026 GreenPack EU Horizon Project
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
