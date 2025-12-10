export type SectionType = 'hero' | 'features' | 'cta' | 'testimonials' | 'footer';

export interface SectionContent {
  title?: string;
  subtitle?: string;
  text?: string;
  image?: string;
  buttonText?: string;
  buttonLink?: string;
  items?: FeatureItem[]; // For features or testimonials
}

export interface FeatureItem {
  title: string;
  description: string;
  icon?: string;
  avatar?: string; // For testimonials
  name?: string;   // For testimonials
  role?: string;   // For testimonials
}

export interface Section {
  id: string;
  type: SectionType;
  content: SectionContent;
}

export interface LandingPage {
  id?: string;
  userId: string;
  slug: string;
  name: string;
  isPublished: boolean;
  sections: Section[];
  createdAt: number; // Timestamp
  theme?: 'light' | 'dark' | 'blue';
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
}
