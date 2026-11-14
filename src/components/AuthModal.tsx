import React, { useState } from 'react';
import { X, Lock, Mail, User, Sparkles, ShieldCheck } from 'lucide-react';
import { Language, UserSession } from '../types';
import { translations } from '../translations';
import { supabase, localStore } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onLoginSuccess: (session: UserSession) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, lang, onLoginSuccess }) => {
  const t = translations[lang];
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (supabase) {
        if (isSignUp) {
          const { data, error: signUpErr } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName } }
          });
          if (signUpErr) throw signUpErr;
          if (data.user) {
            // Check profile
            const session: UserSession = {
              id: data.user.id,
              email: data.user.email || email,
              role: email.includes('admin') ? 'super_admin' : 'member'
            };
            onLoginSuccess(session);
            onClose();
          }
        } else {
          const { data, error: signInErr } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          if (signInErr) throw signInErr;
          if (data.user) {
            const session: UserSession = {
              id: data.user.id,
              email: data.user.email || email,
              role: email.includes('admin') ? 'super_admin' : 'member'
            };
            onLoginSuccess(session);
            onClose();
          }
        }
      } else {
        // Local simulation fallback
        const members = localStore.getMembers();
        let matchedMember = members.find(m => m.user_id.includes(email.split('@')[0]));
        const role = email.includes('admin') ? 'super_admin' : 'member';
        
        const session: UserSession = {
          id: matchedMember ? matchedMember.user_id : 'user-' + Date.now(),
          email: email || 'user@atlas.ai',
          role: role,
          profile: matchedMember
        };
        localStorage.setItem('atlas_current_session', JSON.stringify(session));
        onLoginSuccess(session);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleInstantDemoLogin = (isAdmin: boolean) => {
    const session: UserSession = {
      id: isAdmin ? 'user-admin' : 'user-2',
      email: isAdmin ? 'admin@atlas.ai' : 'member@atlas.ai',
      role: isAdmin ? 'super_admin' : 'member'
    };
    localStorage.setItem('atlas_current_session', JSON.stringify(session));
    onLoginSuccess(session);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800">
        
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {isSignUp ? (lang === 'bn' ? 'একাউন্ট তৈরি করুন' : 'Create Account') : (lang === 'bn' ? 'প্রবেশ করুন' : 'Sign In')}
              </h3>
              <p className="text-xs text-slate-500">Atlas AI Institute Directory</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Instant Demo Login Buttons */}
          <div className="space-y-2 bg-indigo-50/50 dark:bg-indigo-950/30 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
            <p className="text-xs font-semibold text-indigo-900 dark:text-indigo-300 mb-2">
              {lang === 'bn' ? 'দ্রুত ডেমো লগইন (সরাসরি টেস্ট করুন):' : 'Instant Demo Logins (Quick Test):'}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleInstantDemoLogin(true)}
                className="px-3 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Super Admin</span>
              </button>
              <button
                type="button"
                onClick={() => handleInstantDemoLogin(false)}
                className="px-3 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5"
              >
                <User className="w-3.5 h-3.5" />
                <span>Member Profile</span>
              </button>
            </div>
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            <span className="flex-shrink mx-4 text-xs text-slate-400 uppercase tracking-wider">Or email auth</span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          </div>

          {error && (
            <div className="p-3 text-xs text-red-600 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t.fullName}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Dr. Tanvir Ahmed"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@atlas.ai"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              {loading ? 'Processing...' : (isSignUp ? (lang === 'bn' ? 'একাউন্ট তৈরি করুন' : 'Create Account') : (lang === 'bn' ? 'প্রবেশ করুন' : 'Sign In'))}
            </button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
            >
              {isSignUp ? (lang === 'bn' ? 'ইতিমধ্যে একাউন্ট আছে? প্রবেশ করুন' : 'Already have an account? Sign in') : (lang === 'bn' ? 'একাউন্ট নেই? নতুন একাউন্ট খুলুন' : "Don't have an account? Sign up")}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
