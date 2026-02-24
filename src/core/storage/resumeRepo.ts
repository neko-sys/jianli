import { db } from './db';
import type { LayoutState, Resume } from '../domain/types';
import { migratePayload, migrateResume, type ExportPayload } from './migrations';
import { SCHEMA_VERSION } from '../domain/types';

export const resumeRepo = {
  async list(): Promise<Resume[]> {
    const items = await db.resumes.orderBy('updatedAt').reverse().toArray();
    return items.map(migrateResume);
  },

  async get(id: string): Promise<Resume | undefined> {
    const resume = await db.resumes.get(id);
    return resume ? migrateResume(resume) : undefined;
  },

  async save(resume: Resume): Promise<void> {
    await db.resumes.put(migrateResume(resume));
  },

  async delete(id: string): Promise<void> {
    await db.resumes.delete(id);
  },

  async bulkSave(resumes: Resume[]): Promise<void> {
    await db.resumes.bulkPut(resumes.map(migrateResume));
  },

  async saveLayoutState(resumeId: string, layout: LayoutState): Promise<void> {
    const current = await db.resumes.get(resumeId);
    if (!current) {
      return;
    }
    const normalized = migrateResume(current);
    await db.resumes.put({
      ...normalized,
      layout: {
        ...normalized.layout,
        ...layout,
      },
      updatedAt: Date.now(),
    });
  },

  async export(id?: string): Promise<ExportPayload> {
    const resumes = id ? (await db.resumes.get(id) ? [await db.resumes.get(id)] : []) : await db.resumes.toArray();
    const normalized = resumes.filter((item): item is Resume => Boolean(item));
    return {
      schemaVersion: SCHEMA_VERSION,
      exportedAt: Date.now(),
      resumes: normalized.map(migrateResume),
    };
  },

  async import(payload: ExportPayload): Promise<number> {
    const migrated = migratePayload(payload);
    await db.resumes.bulkPut(migrated.resumes);
    return migrated.resumes.length;
  },
};
