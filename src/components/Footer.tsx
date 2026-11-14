import React from 'react';
import { Facebook, Sparkles, Heart } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

interface FooterProps {
  lang: Language;
}

export const Footer: React.FC<FooterProps> = ({ lang }) => {
  const t = translations[lang];

  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-white font-bold text-lg tracking-tight">
                {t.brandName}
              </span>
            </div>
            <p className="text-sm max-w-md text-slate-400 leading-relaxed">
              {lang === 'bn'
                ? 'অ্যাটলাস এআই ইনস্টিটিউট দক্ষিণ এশিয়ায় কৃত্রিম বুদ্ধিমত্তা গবেষণা, উন্নত নিউরাল মডেল প্রশিক্ষণ এবং দায়িত্বশীল প্রযুক্তি ইকোসিস্টেম গড়ে তুলতে প্রতিজ্ঞাবদ্ধ।'
                : 'Atlas AI Institute is dedicated to advancing artificial intelligence research, neural model training, and responsible technology ecosystems across South Asia.'}
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">
              {lang === 'bn' ? 'অফিসিয়াল লিংক' : 'Official Links'}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <Facebook className="w-4 h-4 text-indigo-400" />
                  <span>{t.visitFacebook}</span>
                </a>
              </li>
              <li>
                <span className="text-slate-500">
                  {lang === 'bn' ? 'ঠিকানা: ঢাকা, বাংলাদেশ' : 'Location: Dhaka, Bangladesh'}
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">
              {lang === 'bn' ? 'প্রযুক্তি স্ট্যাক' : 'Technology Stack'}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Built with Supabase Auth, PostgreSQL RLS, React 19, Tailwind CSS, and TypeScript.
            </p>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} {t.brandName}. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Powered by Supabase RLS & PostgreSQL</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
