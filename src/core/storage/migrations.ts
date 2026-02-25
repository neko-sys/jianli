import { SCHEMA_VERSION, type Resume, type SectionType } from '../domain/types';
import { createDefaultLayout } from '../domain/factories';
import { applyLayoutConstraints } from '../domain/layoutConstraints';

export interface ExportPayload {
  schemaVersion: number;
  exportedAt: number;
  resumes: Resume[];
}

const normalizeBackgroundPattern = (value: unknown): Resume['layout']['backgroundPattern'] =>
  value === 'wave' ? 'wave' : 'none';

export const migrateResume = (resume: Resume): Resume => {
  const sectionOrder: SectionType[] = resume.layout?.sectionOrder ?? createDefaultLayout().sectionOrder;
  const defaultLayout = createDefaultLayout();
  const profile = {
    avatar: '',
    name: '',
    phone: '',
    email: '',
    city: '',
    summary: '',
    ...(resume.profile ?? {}),
  };
  if (resume.schemaVersion === SCHEMA_VERSION) {
    const next = {
      ...resume,
      profile,
      layout: {
        ...defaultLayout,
        ...resume.layout,
        sectionOrder,
        sectionItemsOrder: {
          ...defaultLayout.sectionItemsOrder,
          ...resume.layout?.sectionItemsOrder,
        },
        sectionVisibility: {
          ...defaultLayout.sectionVisibility,
          ...resume.layout?.sectionVisibility,
        },
        sectionRegions: {
          ...defaultLayout.sectionRegions,
          ...resume.layout?.sectionRegions,
        },
        backgroundPattern: normalizeBackgroundPattern(resume.layout?.backgroundPattern),
        presets: resume.layout?.presets ?? [],
      },
    };
    return {
      ...next,
      layout: applyLayoutConstraints(next.layout),
    };
  }

  const next = {
    ...resume,
    schemaVersion: SCHEMA_VERSION,
    profile,
    layout: {
      ...defaultLayout,
      ...resume.layout,
      sectionOrder,
      sectionItemsOrder: {
        ...defaultLayout.sectionItemsOrder,
        ...resume.layout?.sectionItemsOrder,
      },
      sectionVisibility: {
        ...defaultLayout.sectionVisibility,
        ...resume.layout?.sectionVisibility,
      },
      sectionRegions: {
        ...defaultLayout.sectionRegions,
        ...resume.layout?.sectionRegions,
      },
      backgroundPattern: normalizeBackgroundPattern(resume.layout?.backgroundPattern),
      presets: resume.layout?.presets ?? [],
    },
  };
  return {
    ...next,
    layout: applyLayoutConstraints(next.layout),
  };
};

export const migratePayload = (payload: ExportPayload): ExportPayload => ({
  ...payload,
  schemaVersion: SCHEMA_VERSION,
  resumes: payload.resumes.map(migrateResume),
});
