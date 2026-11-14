import React, { useState, useEffect } from 'react';
import { Search, Building2, Facebook, Heart, Sparkles, ExternalLink, ShieldCheck, Check, Share2, Filter } from 'lucide-react';
import { Organization, MemberProfile, Language } from '../types';
import { translations } from '../translations';
import { localStore, supabase } from '../lib/supabase';

interface DirectoryHomeProps {
  lang: Language;
  navigate: (route: string) => void;
}

export const DirectoryHome: React.FC<DirectoryHomeProps> = ({ lang, navigate }) => {
  const t = translations[lang];
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrgId, setSelectedOrgId] = useState<string>('all');
  const [selectedService, setSelectedService] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (supabase) {
      const { data: orgs } = await supabase.from('organizations').select('*');
      const { data: mems } = await supabase.from('member_profiles').select('*, organization:organizations(*)');
      if (orgs) setOrganizations(orgs);
      if (mems) setMembers(mems);
    } else {
      const orgs = localStore.getOrganizations();
      const mems = localStore.getMembers();
      // map org data
      const enriched = mems.map(m => ({
        ...m,
        organization: orgs.find(o => o.id === m.organization_id)
      }));
      setOrganizations(orgs);
      setMembers(enriched);
    }
  };

  const handleLike = async (e: React.MouseEvent, memberId: string) => {
    e.stopPropagation();
    if (supabase) {
      const { data } = await supabase.rpc('increment_likes', { profile_id: memberId });
      if (data !== null) {
        setMembers(members.map(m => m.id === memberId ? { ...m, likes_count: data } : m));
      }
    } else {
      const newCount = localStore.incrementLike(memberId);
      setMembers(members.map(m => m.id === memberId ? { ...m, likes_count: newCount } : m));
    }
    showToast(lang === 'bn' ? 'লাইক যোগ করা হয়েছে!' : 'Liked profile!');
  };

  const handleCopyLink = (e: React.MouseEvent, username: string) => {
    e.stopPropagation();
    const url = `${window.location.origin}/#/profile/${username}`;
    navigator.clipboard.writeText(url);
    showToast(t.linkCopied);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Extract all unique services for filter
  const allServices = Array.from(new Set(members.flatMap(m => m.services || [])));

  // Filter members
  const filteredMembers = members.filter(m => {
    const matchesSearch = 
      m.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.designation_en && m.designation_en.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.designation_bn && m.designation_bn.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.services && m.services.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesOrg = selectedOrgId === 'all' || m.organization_id === selectedOrgId;
    const matchesService = selectedService === 'all' || (m.services && m.services.includes(selectedService));

    // Show public profiles, or protected ones in directory with lock badge
    return matchesSearch && matchesOrg && matchesService;
  });

  return (
    <div className="space-y-12 pb-16">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-900 text-white py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(79,70,229,0.15),transparent_50%)]"></div>
        <div className="max-w-7xl mx-auto relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>{t.brandName} • Official Member Directory</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-3xl mx-auto leading-tight">
            {lang === 'bn' ? 'এআই গবেষক, প্রবক্তা ও বিশেষজ্ঞদের ডিরেক্টরি' : 'Multi-Organization AI Researcher & Member Directory'}
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
            {t.tagline}
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto pt-4">
            <div className="relative flex items-center shadow-2xl">
              <Search className="absolute left-4 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Directory Content & Filters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Filter Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          
          {/* Org Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
            <button
              onClick={() => setSelectedOrgId('all')}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap shrink-0 ${
                selectedOrgId === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {t.filterAllOrgs}
            </button>
            {organizations.map(org => (
              <button
                key={org.id}
                onClick={() => setSelectedOrgId(org.id)}
                className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap shrink-0 ${
                  selectedOrgId === org.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {lang === 'bn' ? org.name_bn : org.name_en}
              </button>
            ))}
          </div>

          {/* Service Filter Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="px-3 py-2 text-xs font-medium bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">{t.filterAllServices}</option>
              {allServices.map(srv => (
                <option key={srv} value={srv}>{srv}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Member Grid */}
        {filteredMembers.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {t.noMembersFound}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map(member => {
              const org = organizations.find(o => o.id === member.organization_id);
              return (
                <div
                  key={member.id}
                  onClick={() => navigate(`/profile/${member.username}`)}
                  className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden"
                >
                  <div>
                    {/* Top Row: Org Badge & Visibility */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-1 rounded-full truncate">
                        {org ? (lang === 'bn' ? org.name_bn : org.name_en) : t.brandName}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        member.is_public ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'
                      }`}>
                        {member.is_public ? t.public : t.protected}
                      </span>
                    </div>

                    {/* Member Info */}
                    <div className="space-y-1 mb-4">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {member.full_name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {lang === 'bn' ? member.designation_bn : member.designation_en}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        @{member.username}
                      </p>
                    </div>

                    {/* Bio Snippet */}
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-4 leading-relaxed">
                      {lang === 'bn' ? member.bio_bn : member.bio_en}
                    </p>

                    {/* Services Chips */}
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {member.services && member.services.slice(0, 3).map(srv => (
                        <span key={srv} className="text-[10px] font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                          {srv}
                        </span>
                      ))}
                      {member.services && member.services.length > 3 && (
                        <span className="text-[10px] font-medium text-slate-400 px-1 py-0.5">
                          +{member.services.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    {/* Live Facebook Button */}
                    <a
                      href={member.facebook_url || 'https://facebook.com'}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      <Facebook className="w-3.5 h-3.5" />
                      <span>{t.visitFacebook}</span>
                    </a>

                    <div className="flex items-center gap-2">
                      {/* Copy Link */}
                      <button
                        onClick={(e) => handleCopyLink(e, member.username)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        title={t.copyProfileLink}
                      >
                        <Share2 className="w-4 h-4" />
                      </button>

                      {/* Like Button */}
                      <button
                        onClick={(e) => handleLike(e, member.id)}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors"
                      >
                        <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                        <span>{member.likes_count || 0}</span>
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </section>

    </div>
  );
};
