import { describe, expect, it } from 'vitest';
import { createDefaultLayout } from '../core/domain/factories';
import { applyLayoutConstraints } from '../core/domain/layoutConstraints';

describe('layout constraints', () => {
  it('forces profile section fixed and visible', () => {
    const layout = createDefaultLayout();
    const next = applyLayoutConstraints({
      ...layout,
      sectionOrder: ['work', 'profile', 'education', 'skills', 'projects', 'jobTarget'],
      sectionVisibility: {
        ...layout.sectionVisibility,
        profile: false,
      },
      sectionRegions: {
        ...layout.sectionRegions,
        profile: 'right',
      },
    });

    expect(next.sectionOrder[0]).toBe('profile');
    expect(next.sectionVisibility.profile).toBe(true);
    expect(next.sectionRegions.profile).toBe('left');
  });

  it('restores missing sections into order', () => {
    const layout = createDefaultLayout();
    const next = applyLayoutConstraints({
      ...layout,
      sectionOrder: ['profile', 'projects'],
    });

    expect(next.sectionOrder).toContain('education');
    expect(next.sectionOrder).toContain('work');
    expect(next.sectionOrder).toContain('skills');
    expect(next.sectionOrder).toContain('certificates');
    expect(next.sectionOrder.length).toBe(7);
  });
});
