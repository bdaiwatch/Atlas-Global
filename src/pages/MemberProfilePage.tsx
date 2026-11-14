import React, { useState, useEffect } from 'react';
import { Building2, Facebook, Heart, Share2, ArrowLeft, Lock, Check, Sparkles, User, Globe } from 'lucide-react';
import { MemberProfile, Organization, Language, UserSession } from '../types';
import { translations } from '../translations';
import { localStore, supabase } from '../lib/supabase';

interface MemberProfilePageProps {
  username: string;
  lang: Language;
  navigate: (route: string) => void;
  user: UserSession | null;
  onOpenAuth: () => void;
}

export const MemberProfilePage: React.FC<MemberProfilePageProps> = ({
  username,
  lang,
  navigate,
  user,
  onOpenAuth,
}) => {
  const t = translations[lang];
  const [member, setMember] = useState<MemberProfile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, [username]);

  const loadProfile = async () => {
    setLoading(true);
    if (supabase) {
      const { data: mems } = await supabase
        .from('member_profiles')
        .select('*, organization:organizations(*)')
        .eq('username', username)
        .single();
      if (mems) {
        setMember(mems);
        setOrganization(mems.organization);
      }
    } else {
      const members = localStore.getMembers();
      const orgs = localStore.getOrganizations();
      const found = members.find(m => m.username === username);
      if (found) {
        setMember(found);
        setOrganization(orgs.find(o => o.id === found.organization_id) || null);
      }
    }
    setLoading(false);
  };

  const handleLike = async () => {
    if (!member) return;
    if (supabase) {
      const { data } = await supabase.rpc('increment_likes', { profile_id: member.id });
      if (data !== null) {
        setMember({ ...member, likes_count: data });
      }
    } else {
      const newCount = localStore.incrementLike(member.id);
      setMember({ ...member, likes_count: newCount });
    }
    showToast(lang === 'bn' ? 'লাইক যোগ করা হয়েছে!' : 'Liked profile!');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast(t.linkCopied);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-sm text-slate-500 animate-pulse">Loading profile...</p>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Profile Not Found</h2>
        <p className="text-sm text-slate-500">The requested profile (@{username}) does not exist or has been removed.</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
        >
          Back to Directory
        </button>
      </div>
    );
  }

  // Check if profile is protected and user is not signed in
  const isProtectedAndLocked = !member.is_public && !user;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{lang === 'bn' ? 'ডিরেক্টরিতে ফিরে যান' : 'Back to Directory'}</span>
      </button>

      {/* Profile Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        
        {/* Header Banner */}
        <div className="h-40 bg-gradient-to-r from-indigo-600 via-indigo-700 to-emerald-600 p-6 flex items-end justify-between relative">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
              member.is_public ? 'bg-white/20 text-white backdrop-blur-md' : 'bg-amber-500/20 text-amber-200 backdrop-blur-md'
            }`}>
              {member.is_public ? t.public : t.protected}
            </span>
          </div>

          <div className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-900 shadow-lg border-4 border-white dark:border-slate-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-2xl">
            {member.full_name.charAt(0)}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-8 space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-3 py-1 rounded-full">
                  {organization ? (lang === 'bn' ? organization.name_bn : organization.name_en) : t.brandName}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {member.full_name}
              </h1>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                {lang === 'bn' ? member.designation_bn : member.designation_en}
              </p>
              <p className="text-xs text-slate-400 font-mono">
                @{member.username}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <a
                href={member.facebook_url || 'https://facebook.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-colors"
              >
                <Facebook className="w-4 h-4" />
                <span>{t.visitFacebook}</span>
              </a>

              <button
                onClick={handleCopyLink}
                className="p-2.5 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                title={t.copyProfileLink}
              >
                <Share2 className="w-4 h-4" />
              </button>

              <button
                onClick={handleLike}
                className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors"
              >
                <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                <span>{member.likes_count || 0}</span>
              </button>
            </div>
          </div>

          {/* Protected Lock Screen Check */}
          {isProtectedAndLocked ? (
            <div className="py-16 text-center space-y-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800">
              <Lock className="w-12 h-12 text-amber-500 mx-auto" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Protected Profile</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                {t.protectedMessage}
              </p>
              <button
                onClick={onOpenAuth}
                className="px-6 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-colors"
              >
                {t.login}
              </button>
            </div>
          ) : (
            <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              {/* Bio */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  {t.bio}
                </h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {lang === 'bn' ? member.bio_bn : member.bio_en}
                </p>
              </div>

              {/* Services & Skills */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  {t.servicesSkills}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {member.services && member.services.map(srv => (
                    <span
                      key={srv}
                      className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 px-3 py-1 rounded-lg"
                    >
                      {srv}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
