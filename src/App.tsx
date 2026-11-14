import React, { useState, useEffect } from 'react';
import { Language, UserSession } from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { AuthModal } from './components/AuthModal';
import { DirectoryHome } from './pages/DirectoryHome';
import { MemberProfilePage } from './pages/MemberProfilePage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminPage } from './pages/AdminPage';

export default function App() {
  const [lang, setLang] = useState<Language>('bn'); // Default to Bangla UI as requested
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('atlas_theme');
      if (saved === 'dark') return true;
      if (saved === 'light') return false;
      return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
    } catch {
      return false;
    }
  });
  const [currentRoute, setCurrentRoute] = useState<string>('home');
  const [routeParam, setRouteParam] = useState<string | null>(null);
  const [user, setUser] = useState<UserSession | null>(null);
  
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    try {
      localStorage.setItem('atlas_theme', isDark ? 'dark' : 'light');
    } catch {
      // ignore storage errors
    }
  }, [isDark]);

  useEffect(() => {
    // Check stored session
    const storedSession = localStorage.getItem('atlas_current_session');
    if (storedSession) {
      try {
        setUser(JSON.parse(storedSession));
      } catch (e) {
        console.error(e);
      }
    }

    // Handle hash/path routing
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash.startsWith('/profile/')) {
        const username = hash.replace('/profile/', '');
        setCurrentRoute('profile');
        setRouteParam(username);
      } else if (hash === '/dashboard') {
        setCurrentRoute('dashboard');
        setRouteParam(null);
      } else if (hash === '/admin') {
        setCurrentRoute('admin');
        setRouteParam(null);
      } else {
        setCurrentRoute('home');
        setRouteParam(null);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // initial check

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (route: string) => {
    window.location.hash = route;
  };

  const handleSignOut = () => {
    localStorage.removeItem('atlas_current_session');
    setUser(null);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      
      {/* Navbar */}
      <Navbar
        currentRoute={currentRoute}
        navigate={navigate}
        lang={lang}
        setLang={setLang}
        isDark={isDark}
        onToggleTheme={() => setIsDark((prev) => !prev)}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        onSignOut={handleSignOut}
      />

      {/* Main Content View */}
      <main className="flex-grow">
        {currentRoute === 'home' && (
          <DirectoryHome lang={lang} navigate={navigate} />
        )}
        {currentRoute === 'profile' && routeParam && (
          <MemberProfilePage
            username={routeParam}
            lang={lang}
            navigate={navigate}
            user={user}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        )}
        {currentRoute === 'dashboard' && (
          <DashboardPage user={user} lang={lang} navigate={navigate} />
        )}
        {currentRoute === 'admin' && (
          <AdminPage user={user} lang={lang} navigate={navigate} />
        )}
      </main>

      {/* Footer */}
      <Footer lang={lang} />

      {/* Modals */}
      <SupabaseConfigModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        lang={lang}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        lang={lang}
        onLoginSuccess={(session) => setUser(session)}
      />

    </div>
  );
}
