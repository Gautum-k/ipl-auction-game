import React from 'react';
import { BookOpen } from 'lucide-react';

export const Glossary: React.FC = () => {
  const terms = [
    {
      term: 'Lakh (L)',
      definition: 'A unit in the Indian numbering system equal to 100,000 Rupees. For example, ₹20 Lakhs = ₹2,00,000.',
    },
    {
      term: 'Crore (Cr)',
      definition: 'A unit in the Indian numbering system equal to 10,00,00,000 Rupees (10 Million or 100 Lakhs). For example, ₹2 Crore = 200 Lakhs.',
    },
    {
      term: 'Capped Player',
      definition: 'A cricketer who has played at least one international match (Test, ODI, or T20I) for their senior national team.',
    },
    {
      term: 'Uncapped Player',
      definition: 'A domestic cricketer who has not yet represented their national team in senior international cricket.',
    },
    {
      term: 'Right To Match (RTM)',
      definition: 'A mega-auction rule allowing a player’s previous IPL franchise to match the highest bid and buy back the player.',
    },
    {
      term: 'Marquee Set',
      definition: 'The initial elite set of world-class international superstars and franchise icons auctioned first in the mega auction.',
    },
  ];

  return (
    <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 text-white shadow-xl">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-xl font-bold">IPL Auction Glossary</h3>
          <p className="text-xs text-slate-400">Key terms and cricket terminology explained for beginners</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {terms.map((t) => (
          <div key={t.term} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <h4 className="font-bold text-amber-400 text-sm">{t.term}</h4>
            <p className="text-xs text-slate-300 leading-relaxed">{t.definition}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
