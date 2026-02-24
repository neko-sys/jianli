import type { LayoutState, Resume, SectionType } from './types';
import { SCHEMA_VERSION } from './types';

const defaultSectionOrder: SectionType[] = [
  'profile',
  'jobTarget',
  'education',
  'work',
  'skills',
  'projects',
];

const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const createDefaultLayout = (): LayoutState => ({
  sectionOrder: [...defaultSectionOrder],
  sectionItemsOrder: {
    education: [],
    work: [],
    skills: [],
    projects: [],
  },
  sectionVisibility: {
    profile: true,
    jobTarget: true,
    education: true,
    work: true,
    skills: true,
    projects: true,
  },
  sectionRegions: {
    profile: 'left',
    jobTarget: 'left',
    skills: 'left',
    education: 'right',
    work: 'right',
    projects: 'right',
  },
  twoColumnRatio: 1.6,
  presets: [],
});

export const createDefaultResume = (title = '未命名简历'): Resume => {
  const now = Date.now();
  const resume: Resume = {
    id: newId(),
    title,
    templateId: 'minimal',
    schemaVersion: SCHEMA_VERSION,
    updatedAt: now,
    profile: {
      avatar: '',
      name: '',
      phone: '',
      email: '',
      city: '',
      summary: '',
    },
    jobTarget: {
      title: '',
      direction: '',
      years: '',
      salaryExpectation: '',
    },
    education: [
      {
        id: newId(),
        school: '',
        degree: '',
        major: '',
        period: '',
        highlights: '',
      },
    ],
    work: [
      {
        id: newId(),
        company: '',
        role: '',
        period: '',
        description: '',
      },
    ],
    skills: [
      {
        id: newId(),
        category: '技术栈',
        content: '',
      },
    ],
    projects: [
      {
        id: newId(),
        name: '',
        role: '',
        period: '',
        techStack: [],
        description: '',
        highlights: [],
        metrics: [],
      },
    ],
    layout: createDefaultLayout(),
  };

  resume.layout.sectionItemsOrder.education = resume.education.map((item) => item.id);
  resume.layout.sectionItemsOrder.work = resume.work.map((item) => item.id);
  resume.layout.sectionItemsOrder.skills = resume.skills.map((item) => item.id);
  resume.layout.sectionItemsOrder.projects = resume.projects.map((item) => item.id);

  return resume;
};

export const touchResume = (resume: Resume): Resume => ({
  ...resume,
  updatedAt: Date.now(),
});
