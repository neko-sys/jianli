import { describe, expect, it } from 'vitest';
import { migratePayload } from '../core/storage/migrations';
import { createDefaultResume } from '../core/domain/factories';
import { SCHEMA_VERSION } from '../core/domain/types';

describe('migrations', () => {
  it('upgrades payload schema version', () => {
    const oldResume = { ...createDefaultResume('old'), schemaVersion: 0 };
    const result = migratePayload({
      schemaVersion: 0,
      exportedAt: Date.now(),
      resumes: [oldResume],
    });
    expect(result.schemaVersion).toBe(SCHEMA_VERSION);
    expect(result.resumes[0].schemaVersion).toBe(SCHEMA_VERSION);
    expect(result.resumes[0].layout.sectionVisibility.profile).toBe(true);
    expect(result.resumes[0].layout.twoColumnRatio).toBeGreaterThanOrEqual(1);
    expect(result.resumes[0].layout.showTechIcons).toBe(true);
    expect(result.resumes[0].layout.showProfileIcons).toBe(true);
  });
});
