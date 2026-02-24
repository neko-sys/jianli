import { describe, expect, it } from 'vitest';
import { createDefaultResume } from '../core/domain/factories';
import { resumeSchema } from '../core/domain/schema';

describe('resume schema', () => {
  it('validates default resume', () => {
    const resume = createDefaultResume('测试简历');
    const result = resumeSchema.safeParse(resume);
    expect(result.success).toBe(true);
  });
});
