export const SCHEMA_VERSION = 2;

export type SectionType =
  | 'profile'
  | 'jobTarget'
  | 'education'
  | 'work'
  | 'skills'
  | 'projects';

export type SectionOrder = SectionType[];

export type SectionItemsOrder = Record<string, string[]>;
export type SectionVisibility = Record<SectionType, boolean>;
export type SectionRegion = 'left' | 'right';
export type SectionRegions = Partial<Record<SectionType, SectionRegion>>;
export type BackgroundPattern = 'none' | 'wave';
export type BorderPattern = 'none' | 'line' | 'double' | 'corner' | 'left-accent';

export interface LayoutPreset {
  id: string;
  name: string;
  sectionOrder: SectionOrder;
  sectionVisibility: SectionVisibility;
  sectionRegions: SectionRegions;
  twoColumnRatio: number;
  showTechIcons: boolean;
  showProfileIcons: boolean;
}

export interface Profile {
  avatar: string;
  name: string;
  phone: string;
  email: string;
  wechat: string;
  github: string;
  city: string;
  summary: string;
}

export interface JobTarget {
  title: string;
  direction: string;
  years: string;
  salaryExpectation: string;
}

export interface EducationItem {
  id: string;
  school: string;
  degree: string;
  major: string;
  period: string;
  highlights: string;
}

export interface WorkItem {
  id: string;
  company: string;
  role: string;
  period: string;
  description: string;
}

export interface SkillItem {
  id: string;
  category: string;
  content: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  role: string;
  period: string;
  techStack: string[];
  description: string;
  highlights: string[];
  metrics: string[];
}

export interface LayoutState {
  sectionOrder: SectionOrder;
  sectionItemsOrder: SectionItemsOrder;
  sectionVisibility: SectionVisibility;
  sectionRegions: SectionRegions;
  twoColumnRatio: number;
  showTechIcons: boolean;
  showProfileIcons: boolean;
  backgroundPattern: BackgroundPattern;
  borderPattern: BorderPattern;
  presets: LayoutPreset[];
}

export interface Resume {
  id: string;
  title: string;
  templateId: string;
  schemaVersion: number;
  updatedAt: number;
  profile: Profile;
  jobTarget: JobTarget;
  education: EducationItem[];
  work: WorkItem[];
  skills: SkillItem[];
  projects: ProjectItem[];
  layout: LayoutState;
}

export interface TemplateConfig {
  id: string;
  name: string;
  supportsTwoColumn: boolean;
}
