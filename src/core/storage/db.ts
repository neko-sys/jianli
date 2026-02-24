import Dexie, { type Table } from 'dexie';
import type { Resume } from '../domain/types';

export class ResumeDB extends Dexie {
  resumes!: Table<Resume, string>;

  constructor() {
    super('resume-builder-db');
    this.version(1).stores({
      resumes: '&id, updatedAt, title, templateId',
    });
  }
}

export const db = new ResumeDB();
