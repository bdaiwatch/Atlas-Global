import React from 'react';
import { User, Shield, LogOut, Globe, Database, Sparkles, Sun, Moon } from 'lucide-react';
import { Language, UserSession } from '../types';
import { translations } from '../translations';

interface NavbarProps {
  currentRoute: string;
  navigate: (route: string) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  user: UserSession | null;
  onOpenAuth: () => void;
  onOpenSupabaseModal: () => void;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRoute,
  navigate,
  lang,
  setLang,
  isDark,
  onToggleTheme,
  user,
  onOpenAuth,
  onOpenSupabaseModal,
  onSignOut,
}) => {
  const t = translations[lang];

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        
        {/* Zone 1: Brand Wordmark */}
        <div 
          onClick={() => navigate('/')}
          className="flex items-center gap-3 cursor-pointer shrink-0 group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white block leading-tight">
              {t.brandName}
            </span>
            <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 block">
              Atlas AI Institute
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <button
            onClick={() => navigate('/')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-indigo-600 dark:hover:text-indigo-400 ${
              currentRoute === 'home' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''
            }`}
          >
            {t.navDirectory}
          </button>
          <button
            onClick={() => navigate('/')}
            className="transition-colors whitespace-nowrap shrink-0 hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            {t.navOrganizations}
          </button>
          {user && (
            <button
              onClick={() => navigate('/dashboard')}
              className={`transition-colors whitespace-nowrap shrink-0 hover:text-indigo-600 dark:hover:text-indigo-400 ${
                currentRoute === 'dashboard' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''
              }`}
            >
              {t.navDashboard}
            </button>
          )}
          {user?.role === 'super_admin' && (
            <button
              onClick={() => navigate('/admin')}
              className={`transition-colors whitespace-nowrap shrink-0 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 ${
                currentRoute === 'admin' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              {t.navAdmin}
            </button>
          )}
        </nav>

        {/* Zone 3: Primary Actions (Theme toggle, Supabase Setup, Language toggle, Auth) */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Dark Mode Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            title={
              isDark
                ? lang === 'bn' ? 'লাইট মোড চালু করুন' : 'Switch to Light Mode'
                : lang === 'bn' ? 'ডার্ক মোড চালু করুন' : 'Switch to Dark Mode'
            }
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-pressed={isDark}
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Supabase / SQL Config Button */}
          <button
            onClick={onOpenSupabaseModal}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors relative"
            title="Supabase & SQL Setup"
          >
            <Database className="w-5 h-5" />
          </button>

          {/* Language Toggle */}
          <button
            onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-500" />
            <span>{lang === 'en' ? 'বাংলা' : 'English'}</span>
          </button>

          {/* Auth Button */}
          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/dashboard')}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 rounded-lg border border-indigo-200 dark:border-indigo-800"
              >
                <User className="w-3.5 h-3.5" />
                <span className="max-w-[100px] truncate">{user.email}</span>
              </button>
              <button
                onClick={onSignOut}
                className="p-2 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                title={t.logout}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              <span>{t.login}</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
