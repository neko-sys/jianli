import type { LayoutState, SectionType } from './types';

const ALL_SECTIONS: SectionType[] = [
  'profile',
  'jobTarget',
  'education',
  'work',
  'skills',
  'projects',
];

const uniqueSections = (sections: SectionType[]): SectionType[] => {
  const seen = new Set<SectionType>();
  const next: SectionType[] = [];
  for (const section of sections) {
    if (!seen.has(section)) {
      seen.add(section);
      next.push(section);
    }
  }
  return next;
};

export const applyLayoutConstraints = (layout: LayoutState): LayoutState => {
  const ordered = uniqueSections(layout.sectionOrder);
  for (const section of ALL_SECTIONS) {
    if (!ordered.includes(section)) {
      ordered.push(section);
    }
  }

  const withoutProfile = ordered.filter((section) => section !== 'profile');
  const sectionOrder: SectionType[] = ['profile', ...withoutProfile];

  return {
    ...layout,
    sectionOrder,
    sectionVisibility: {
      ...layout.sectionVisibility,
      profile: true,
    },
    sectionRegions: {
      ...layout.sectionRegions,
      profile: 'left',
    },
  };
};

