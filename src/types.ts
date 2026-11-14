export type Language = 'en' | 'bn';

export interface Organization {
  id: string;
  name_en: string;
  name_bn: string;
  category_en: string;
  category_bn: string;
  description_en: string;
  description_bn: string;
  logo_url?: string;
  created_at: string;
}

export interface MemberProfile {
  id: string;
  user_id: string;
  full_name: string;
  username: string;
  organization_id: string;
  designation_en: string;
  designation_bn: string;
  bio_en: string;
  bio_bn: string;
  services: string[]; // e.g. ["Machine Learning", "NLP", "PyTorch"]
  facebook_url: string;
  profile_theme: 'indigo' | 'emerald' | 'amber' | 'rose' | 'violet';
  is_public: boolean; // true = Public, false = Protected
  likes_count: number;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  // joined fields for display
  organization?: Organization;
}

export type UserRole = 'super_admin' | 'member';

export interface UserSession {
  id: string;
  email: string;
  role: UserRole;
  profile?: MemberProfile;
}
