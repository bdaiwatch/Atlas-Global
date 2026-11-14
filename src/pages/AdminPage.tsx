import React, { useState, useEffect } from 'react';
import { UserSession, Organization, MemberProfile, Language } from '../types';
import { translations } from '../translations';
import { localStore, supabase } from '../lib/supabase';
import { ShieldCheck, Plus, Trash2, Building2, Users, Check, AlertCircle } from 'lucide-react';

interface AdminPageProps {
  user: UserSession | null;
  lang: Language;
  navigate: (route: string) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ user, lang, navigate }) => {
  const t = translations[lang];
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Org Form
  const [nameEn, setNameEn] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [catEn, setCatEn] = useState('');
  const [catBn, setCatBn] = useState('');
  const [descEn, setDescEn] = useState('');
  const [descBn, setDescBn] = useState('');

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
      setOrganizations(localStore.getOrganizations());
      setMembers(localStore.getMembers());
    }
  };

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    const newOrg: Organization = {
      id: 'org-' + Date.now(),
      name_en: nameEn,
      name_bn: nameBn,
      category_en: catEn,
      category_bn: catBn,
      description_en: descEn,
      description_bn: descBn,
      created_at: new Date().toISOString()
    };

    if (supabase) {
      await supabase.from('organizations').insert(newOrg);
    } else {
      const orgs = localStore.getOrganizations();
      orgs.push(newOrg);
      localStore.saveOrganizations(orgs);
    }

    setNameEn('');
    setNameBn('');
    setCatEn('');
    setCatBn('');
    setDescEn('');
    setDescBn('');
    loadData();
    showToast(lang === 'bn' ? 'সংস্থা সফলভাবে তৈরি হয়েছে!' : 'Organization created successfully!');
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to delete this profile?')) return;
    if (supabase) {
      await supabase.from('member_profiles').delete().eq('id', memberId);
    } else {
      const mems = localStore.getMembers().filter(m => m.id !== memberId);
      localStore.saveMembers(mems);
    }
    loadData();
    showToast('Profile deleted successfully.');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  if (!user || user.role !== 'super_admin') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Access Denied</h2>
        <p className="text-sm text-slate-500">You must be signed in as a Super Admin to access this panel.</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Super Admin Panel</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {t.adminTitle}
          </h1>
          <p className="text-sm text-slate-500">{t.adminSubtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Create Org Form */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-indigo-600" />
            <span>{t.addOrganization}</span>
          </h3>

          <form onSubmit={handleCreateOrg} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">{t.orgNameEn}</label>
              <input
                type="text"
                required
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="Atlas AI Institute"
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">{t.orgNameBn}</label>
              <input
                type="text"
                required
                value={nameBn}
                onChange={(e) => setNameBn(e.target.value)}
                placeholder="অ্যাটলাস এআই ইনস্টিটিউট"
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none font-bangla"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">{t.orgCategoryEn}</label>
              <input
                type="text"
                required
                value={catEn}
                onChange={(e) => setCatEn(e.target.value)}
                placeholder="AI Research & Training"
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">{t.orgCategoryBn}</label>
              <input
                type="text"
                required
                value={catBn}
                onChange={(e) => setCatBn(e.target.value)}
                placeholder="এআই গবেষণা ও প্রশিক্ষণ"
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none font-bangla"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">{t.orgDescEn}</label>
              <textarea
                rows={2}
                value={descEn}
                onChange={(e) => setDescEn(e.target.value)}
                placeholder="Description in English..."
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-colors"
            >
              {t.createOrg}
            </button>
          </form>
        </div>

        {/* Organizations & Members Management */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Organizations List */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>{t.navOrganizations} ({organizations.length})</span>
            </h3>

            <div className="space-y-3">
              {organizations.map(org => (
                <div key={org.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{lang === 'bn' ? org.name_bn : org.name_en}</h4>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">{lang === 'bn' ? org.category_bn : org.category_en}</p>
                  </div>
                  <span className="text-[11px] text-slate-400">ID: {org.id}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Members Moderation List */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>{t.members} ({members.length})</span>
            </h3>

            <div className="space-y-3 overflow-x-auto">
              {members.map(member => (
                <div key={member.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{member.full_name}</h4>
                    <p className="text-xs text-slate-500 font-mono">@{member.username} · {member.is_public ? 'Public' : 'Protected'}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteMember(member.id)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors"
                    title={t.deleteOrg}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
