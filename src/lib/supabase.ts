import { createClient } from '@supabase/supabase-js';
import { Organization, MemberProfile } from '../types';

// Default mock initial data for Atlas AI Institute & members
export const INITIAL_ORGANIZATIONS: Organization[] = [
  {
    id: 'org-1',
    name_en: 'Atlas AI Institute',
    name_bn: 'অ্যাটলাস এআই ইনস্টিটিউট',
    category_en: 'AI Research & Training',
    category_bn: 'এআই গবেষণা ও প্রশিক্ষণ',
    description_en: 'Premier research institute advancing foundational neural architectures, generative models, and responsible AI deployment across South Asia.',
    description_bn: 'দক্ষিণ এশিয়ায় মৌলিক নিউরাল আর্কিটেকচার, জেনারেটিভ মডেল এবং দায়িত্বশীল এআই প্রযুক্তিতে অগ্রণী গবেষণা প্রতিষ্ঠান।',
    created_at: new Date().toISOString()
  },
  {
    id: 'org-2',
    name_en: 'Neural Bangla Lab',
    name_bn: 'নিউরাল বাংলা ল্যাব',
    category_en: 'Natural Language Processing',
    category_bn: 'প্রাকৃতিক ভাষা প্রক্রিয়াকরণ',
    description_en: 'Pioneering open-source large language models and speech recognition datasets specifically optimized for low-resource Indic and Bengali dialects.',
    description_bn: 'বিশেষ করে বাংলা ও কম-সম্পদযুক্ত উপভাষার জন্য ওপেন-সোর্স লার্জ ল্যাঙ্গুয়েজ মডেল এবং স্পিচ রিকগনিশন ডেটাসেট নিয়ে কাজ করছে।',
    created_at: new Date().toISOString()
  },
  {
    id: 'org-3',
    name_en: 'RoboVision Robotics Hub',
    name_bn: 'রোবোভিশন রোবটিক্স হাব',
    category_en: 'Computer Vision & Autonomous Systems',
    category_bn: 'কম্পিউটার ভিশন ও অটোনমাস সিস্টেম',
    description_en: 'Developing cutting-edge computer vision perception stacks for autonomous agricultural drones and industrial automation.',
    description_bn: 'স্বয়ংক্রিয় কৃষি ড্রোন এবং শিল্প অটোমেশনের জন্য অত্যাধুনিক কম্পিউটার ভিশন পারসেপশন স্ট্যাক তৈরি করছে।',
    created_at: new Date().toISOString()
  }
];

export const INITIAL_MEMBERS: MemberProfile[] = [
  {
    id: 'mem-1',
    user_id: 'user-admin',
    full_name: 'Dr. Tanvir Ahmed',
    username: 'tanvir-atlas',
    organization_id: 'org-1',
    designation_en: 'Chief AI Scientist & Director',
    designation_bn: 'প্রধান এআই বিজ্ঞানী ও পরিচালক',
    bio_en: 'Leading research on multi-modal neural networks and scalable transformer architectures at Atlas AI Institute. Former AI researcher at MIT.',
    bio_bn: 'অ্যাটলাস এআই ইনস্টিটিউটে মাল্টি-মডাল নিউরাল নেটওয়ার্ক এবং স্কেলেবল ট্রান্সফরমার আর্কিটেকচার নিয়ে গবেষণা পরিচালনা করছেন।',
    services: ['Deep Learning', 'Transformers', 'PyTorch', 'Research Direction', 'AI Governance'],
    facebook_url: 'https://facebook.com',
    profile_theme: 'indigo',
    is_public: true,
    likes_count: 142,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'mem-2',
    user_id: 'user-2',
    full_name: 'Nusrat Jahan Mimi',
    username: 'nusrat-nlp',
    organization_id: 'org-2',
    designation_en: 'Senior NLP Engineer',
    designation_bn: 'সিনিয়র এনএলপি ইঞ্জিনিয়ার',
    bio_en: 'Specializing in Bangla tokenization efficiency, sentiment analysis, and conversational dialogue agents for regional financial inclusion.',
    bio_bn: 'বাংলা টোকেনাইজেশন দক্ষতা, সেন্টিমেন্ট অ্যানালাইসিস এবং আঞ্চলিক আর্থিক অন্তর্ভুক্তির জন্য কনভারসেশনাল এজেন্ট নিয়ে কাজ করছেন।',
    services: ['LLM Fine-tuning', 'Bengali NLP', 'HuggingFace', 'FastAPI', 'Data Curation'],
    facebook_url: 'https://facebook.com',
    profile_theme: 'emerald',
    is_public: true,
    likes_count: 98,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'mem-3',
    user_id: 'user-3',
    full_name: 'Shahriar Hossain',
    username: 'shahriar-vision',
    organization_id: 'org-3',
    designation_en: 'Lead Robotics Researcher',
    designation_bn: 'লিড রোবটিক্স গবেষক',
    bio_en: 'Building real-time edge computer vision systems for object detection and drone navigation using Jetson Orin and TensorRT.',
    bio_bn: 'জেটসন অরি এবং টেন্সরআরটি ব্যবহার করে অবজেক্ট ডিটেকশন এবং ড্রোন নেভিগেশনের জন্য রিয়েল-টাইম এজ কম্পিউটার ভিশন সিস্টেম তৈরি করছেন।',
    services: ['Computer Vision', 'YOLOv10', 'TensorRT', 'ROS2', 'C++ / Python'],
    facebook_url: 'https://facebook.com',
    profile_theme: 'amber',
    is_public: true,
    likes_count: 76,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Helper to get Supabase config from localStorage
export function getStoredSupabaseConfig() {
  const url = localStorage.getItem('atlas_supabase_url') || '';
  const anonKey = localStorage.getItem('atlas_supabase_key') || '';
  return { url, anonKey };
}

export function saveSupabaseConfig(url: string, anonKey: string) {
  localStorage.setItem('atlas_supabase_url', url);
  localStorage.setItem('atlas_supabase_key', anonKey);
}

// Initialize Supabase Client if configured, else null
const { url: storedUrl, anonKey: storedKey } = getStoredSupabaseConfig();
export const supabase = (storedUrl && storedKey) 
  ? createClient(storedUrl, storedKey) 
  : null;

// Local Storage simulation store fallback for robust out-of-the-box experience
class LocalStore {
  getOrganizations(): Organization[] {
    const stored = localStorage.getItem('atlas_orgs');
    if (!stored) {
      localStorage.setItem('atlas_orgs', JSON.stringify(INITIAL_ORGANIZATIONS));
      return INITIAL_ORGANIZATIONS;
    }
    return JSON.parse(stored);
  }

  saveOrganizations(orgs: Organization[]) {
    localStorage.setItem('atlas_orgs', JSON.stringify(orgs));
  }

  getMembers(): MemberProfile[] {
    const stored = localStorage.getItem('atlas_members');
    if (!stored) {
      localStorage.setItem('atlas_members', JSON.stringify(INITIAL_MEMBERS));
      return INITIAL_MEMBERS;
    }
    return JSON.parse(stored);
  }

  saveMembers(members: MemberProfile[]) {
    localStorage.setItem('atlas_members', JSON.stringify(members));
  }

  incrementLike(memberId: string): number {
    const members = this.getMembers();
    let updatedLikes = 0;
    const updated = members.map(m => {
      if (m.id === memberId) {
        updatedLikes = (m.likes_count || 0) + 1;
        return { ...m, likes_count: updatedLikes };
      }
      return m;
    });
    this.saveMembers(updated);
    return updatedLikes;
  }
}

export const localStore = new LocalStore();

// Complete SQL Schema string for the user / Supabase Setup modal
export const SUPABASE_SQL_SCHEMA = `
-- ========================================================
-- ATLAS AI INSTITUTE - SUPABASE POSTGRESQL RLS SCHEMA
-- ========================================================

-- 1. Organizations Table
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name_en TEXT NOT NULL,
    name_bn TEXT NOT NULL,
    category_en TEXT NOT NULL,
    category_bn TEXT NOT NULL,
    description_en TEXT,
    description_bn TEXT,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Member Profiles Table
CREATE TABLE IF NOT EXISTS public.member_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    designation_en TEXT,
    designation_bn TEXT,
    bio_en TEXT,
    bio_bn TEXT,
    services TEXT[] DEFAULT '{}',
    facebook_url TEXT,
    profile_theme TEXT DEFAULT 'indigo',
    is_public BOOLEAN DEFAULT TRUE,
    likes_count INTEGER DEFAULT 0,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_profiles ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for Organizations
CREATE POLICY "Organizations are viewable by everyone" 
ON public.organizations FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert organizations" 
ON public.organizations FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update organizations" 
ON public.organizations FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete organizations" 
ON public.organizations FOR DELETE TO authenticated USING (true);

-- 5. RLS Policies for Member Profiles
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.member_profiles FOR SELECT 
USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.member_profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.member_profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile" 
ON public.member_profiles FOR DELETE 
USING (auth.uid() = user_id);

-- 6. RPC Function to Safely Increment Likes
CREATE OR REPLACE FUNCTION increment_likes(profile_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_likes INTEGER;
BEGIN
  UPDATE public.member_profiles
  SET likes_count = likes_count + 1
  WHERE id = profile_id
  RETURNING likes_count INTO new_likes;
  
  RETURN new_likes;
END;
$$;
`;
