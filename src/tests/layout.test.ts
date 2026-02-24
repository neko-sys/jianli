import { describe, expect, it } from 'vitest';
import { moveItem, moveSection } from '../core/domain/layout';

describe('layout ordering', () => {
  it('moves section by index', () => {
    const next = moveSection(['profile', 'education', 'projects'], 2, 1);
    expect(next).toEqual(['profile', 'projects', 'education']);
  });

  it('moves item inside section map', () => {
    const next = moveItem({ projects: ['a', 'b', 'c'] }, 'projects', 0, 2);
    expect(next.projects).toEqual(['b', 'c', 'a']);
  });
});
