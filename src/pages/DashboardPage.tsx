import React, { useState, useEffect } from 'react';
import { UserSession, Organization, MemberProfile, Language } from '../types';
import { translations } from '../translations';
import { localStore, supabase } from '../lib/supabase';
import { User, Check, Globe, Shield, Sparkles, ExternalLink } from 'lucide-react';

interface DashboardPageProps {
  user: UserSession | null;
  lang: Language;
  navigate: (route: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ user, lang, navigate }) => {
  const t = translations[lang];
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form state
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [designationEn, setDesignationEn] = useState('');
  const [designationBn, setDesignationBn] = useState('');
  const [bioEn, setBioEn] = useState('');
  const [bioBn, setBioBn] = useState('');
  const [servicesStr, setServicesStr] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('https://facebook.com');
  const [profileTheme, setProfileTheme] = useState<'indigo' | 'emerald' | 'amber' | 'rose' | 'violet'>('indigo');
  const [isPublic, setIsPublic] = useState(true);

  useEffect(() => {
    loadOrgsAndProfile();
  }, [user]);

  const loadOrgsAndProfile = async () => {
    if (!user) return;
    setLoading(true);

    let orgs: Organization[] = [];
    if (supabase) {
      const { data } = await supabase.from('organizations').select('*');
      if (data) orgs = data;
    } else {
      orgs = localStore.getOrganizations();
    }
    setOrganizations(orgs);
    if (orgs.length > 0 && !organizationId) {
      setOrganizationId(orgs[0].id);
    }

    // Load user's existing profile
    if (supabase) {
      const { data: profile } = await supabase
        .from('member_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (profile) {
        populateForm(profile);
      }
    } else {
      const members = localStore.getMembers();
      const profile = members.find(m => m.user_id === user.id || m.user_id === 'user-admin');
      if (profile) {
        populateForm(profile);
      }
    }
    setLoading(false);
  };

  const populateForm = (p: MemberProfile) => {
    setFullName(p.full_name);
    setUsername(p.username);
    setOrganizationId(p.organization_id);
    setDesignationEn(p.designation_en || '');
    setDesignationBn(p.designation_bn || '');
    setBioEn(p.bio_en || '');
    setBioBn(p.bio_bn || '');
    setServicesStr((p.services || []).join(', '));
    setFacebookUrl(p.facebook_url || 'https://facebook.com');
    setProfileTheme(p.profile_theme || 'indigo');
    setIsPublic(p.is_public);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const services = servicesStr.split(',').map(s => s.trim()).filter(Boolean);

    const profileData = {
      user_id: user.id,
      full_name: fullName,
      username: username.toLowerCase().replace(/\s+/g, '-'),
      organization_id: organizationId,
      designation_en: designationEn,
      designation_bn: designationBn,
      bio_en: bioEn,
      bio_bn: bioBn,
      services,
      facebook_url: facebookUrl,
      profile_theme: profileTheme,
      is_public: isPublic,
      updated_at: new Date().toISOString()
    };

    if (supabase) {
      const { error } = await supabase
        .from('member_profiles')
        .upsert(profileData, { onConflict: 'user_id' });
      if (error) {
        alert('Error saving profile: ' + error.message);
        return;
      }
    } else {
      const members = localStore.getMembers();
      const index = members.findIndex(m => m.user_id === user.id);
      if (index >= 0) {
        members[index] = { ...members[index], ...profileData };
      } else {
        members.push({
          id: 'mem-' + Date.now(),
          ...profileData,
          likes_count: 0,
          created_at: new Date().toISOString()
        });
      }
      localStore.saveMembers(members);
    }

    showToast(t.profileUpdated);
    setTimeout(() => {
      navigate(`/profile/${profileData.username}`);
    }, 1200);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Authentication Required</h2>
        <p className="text-sm text-slate-500">Please sign in to access your unified member dashboard.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
          <Sparkles className="w-4 h-4" />
          <span>{t.dashboardTitle}</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          {user.email}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t.dashboardSubtitle}
        </p>
      </div>

      {/* Unified Form */}
      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-8 space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
              {t.fullName} *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Dr. Tanvir Ahmed"
              className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Username (Slug) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
              {t.username} *
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-xs text-slate-400">/profile/</span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="tanvir-atlas"
                className="w-full pl-20 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Organization Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
              {t.organization} *
            </label>
            <select
              value={organizationId}
              onChange={(e) => setOrganizationId(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {organizations.map(org => (
                <option key={org.id} value={org.id}>
                  {lang === 'bn' ? org.name_bn : org.name_en}
                </option>
              ))}
            </select>
          </div>

          {/* Facebook URL */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
              {t.facebookUrl}
            </label>
            <input
              type="url"
              required
              value={facebookUrl}
              onChange={(e) => setFacebookUrl(e.target.value)}
              placeholder="https://facebook.com/your-profile"
              className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Designation (English) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
              Designation (English)
            </label>
            <input
              type="text"
              value={designationEn}
              onChange={(e) => setDesignationEn(e.target.value)}
              placeholder="Chief AI Scientist"
              className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Designation (Bangla) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
              পদবী (বাংলা)
            </label>
            <input
              type="text"
              value={designationBn}
              onChange={(e) => setDesignationBn(e.target.value)}
              placeholder="প্রধান এআই বিজ্ঞানী"
              className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bangla"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bio (English) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
              Biography (English)
            </label>
            <textarea
              rows={3}
              value={bioEn}
              onChange={(e) => setBioEn(e.target.value)}
              placeholder="Write your professional bio..."
              className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
            />
          </div>

          {/* Bio (Bangla) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
              জীবনী (বাংলা)
            </label>
            <textarea
              rows={3}
              value={bioBn}
              onChange={(e) => setBioBn(e.target.value)}
              placeholder="আপনার পেশাগত জীবনী লিখুন..."
              className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none font-bangla"
            />
          </div>
        </div>

        {/* Services / Skills */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
            {t.servicesComma}
          </label>
          <input
            type="text"
            value={servicesStr}
            onChange={(e) => setServicesStr(e.target.value)}
            placeholder="Deep Learning, PyTorch, LLM Fine-tuning, NLP"
            className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        {/* Visibility Toggle */}
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">{t.visibility}</h4>
            <p className="text-xs text-slate-500">
              {isPublic ? t.publicBadge : t.protectedBadge}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsPublic(!isPublic)}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors ${
              isPublic
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-amber-600 text-white shadow-sm'
            }`}
          >
            {isPublic ? t.public : t.protected}
          </button>
        </div>

        {/* Submit */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
          >
            {t.saveChanges}
          </button>
        </div>

      </form>

    </div>
  );
};
