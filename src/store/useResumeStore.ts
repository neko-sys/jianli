import { create } from 'zustand';
import type { Resume } from '../core/domain/types';
import { createDefaultResume, touchResume } from '../core/domain/factories';
import { resumeRepo } from '../core/storage/resumeRepo';
import { moveItem, moveSection } from '../core/domain/layout';

interface ResumeState {
  resumes: Resume[];
  current?: Resume;
  loading: boolean;
  error?: string;
  loadAll: () => Promise<void>;
  createResume: (title?: string) => Promise<Resume>;
  selectResume: (id: string) => Promise<void>;
  saveCurrent: (next: Resume) => Promise<void>;
  deleteResume: (id: string) => Promise<void>;
  duplicateResume: (id: string) => Promise<void>;
  applySectionMove: (from: number, to: number) => Promise<void>;
  applyItemMove: (sectionId: string, from: number, to: number) => Promise<void>;
}

export const useResumeStore = create<ResumeState>((set, get) => ({
  resumes: [],
  current: undefined,
  loading: false,
  error: undefined,

  loadAll: async () => {
    set({ loading: true, error: undefined });
    try {
      const resumes = await resumeRepo.list();
      set({ resumes, loading: false });
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : '加载失败' });
    }
  },

  createResume: async (title) => {
    const resume = createDefaultResume(title ?? '新简历');
    await resumeRepo.save(resume);
    const resumes = await resumeRepo.list();
    set({ resumes, current: resume });
    return resume;
  },

  selectResume: async (id) => {
    const resume = await resumeRepo.get(id);
    set({ current: resume });
  },

  saveCurrent: async (next) => {
    const touched = touchResume(next);
    await resumeRepo.save(touched);
    const resumes = await resumeRepo.list();
    set({ current: touched, resumes });
  },

  deleteResume: async (id) => {
    await resumeRepo.delete(id);
    const resumes = await resumeRepo.list();
    const current = get().current?.id === id ? undefined : get().current;
    set({ resumes, current });
  },

  duplicateResume: async (id) => {
    const source = await resumeRepo.get(id);
    if (!source) {
      return;
    }
    const copy: Resume = {
      ...source,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: `${source.title}-副本`,
      updatedAt: Date.now(),
    };
    await resumeRepo.save(copy);
    const resumes = await resumeRepo.list();
    set({ resumes, current: copy });
  },

  applySectionMove: async (from, to) => {
    const current = get().current;
    if (!current) {
      return;
    }

    const next: Resume = {
      ...current,
      layout: {
        ...current.layout,
        sectionOrder: moveSection(current.layout.sectionOrder, from, to),
      },
    };

    await get().saveCurrent(next);
  },

  applyItemMove: async (sectionId, from, to) => {
    const current = get().current;
    if (!current) {
      return;
    }

    const next: Resume = {
      ...current,
      layout: {
        ...current.layout,
        sectionItemsOrder: moveItem(current.layout.sectionItemsOrder, sectionId, from, to),
      },
    };

    await get().saveCurrent(next);
  },
}));
