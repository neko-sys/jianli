import { z } from 'zod';
import { SCHEMA_VERSION } from './types';

const nonEmpty = z.string().default('');

export const resumeSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  templateId: z.string(),
  schemaVersion: z.number().default(SCHEMA_VERSION),
  updatedAt: z.number(),
  profile: z.object({
    avatar: nonEmpty,
    name: nonEmpty,
    gender: nonEmpty,
    age: nonEmpty,
    phone: nonEmpty,
    email: nonEmpty,
    wechat: nonEmpty,
    github: nonEmpty,
    city: nonEmpty,
    summary: nonEmpty,
  }),
  jobTarget: z.object({
    title: nonEmpty,
    direction: nonEmpty,
    years: nonEmpty,
    salaryExpectation: nonEmpty,
  }),
  education: z.array(
    z.object({
      id: z.string(),
      school: nonEmpty,
      degree: nonEmpty,
      major: nonEmpty,
      period: nonEmpty,
      highlights: nonEmpty,
    }),
  ),
  work: z.array(
    z.object({
      id: z.string(),
      company: nonEmpty,
      role: nonEmpty,
      period: nonEmpty,
      description: nonEmpty,
    }),
  ),
  skills: z.array(
    z.object({
      id: z.string(),
      category: nonEmpty,
      content: nonEmpty,
    }),
  ),
  projects: z.array(
    z.object({
      id: z.string(),
      name: nonEmpty,
      role: nonEmpty,
      period: nonEmpty,
      techStack: z.array(z.string()),
      description: nonEmpty,
      highlights: z.array(z.string()),
      metrics: z.array(z.string()),
    }),
  ),
  layout: z.object({
    sectionOrder: z.array(
      z.enum(['profile', 'jobTarget', 'education', 'work', 'skills', 'projects']),
    ),
    sectionItemsOrder: z.record(z.string(), z.array(z.string())),
    sectionVisibility: z.object({
      profile: z.boolean(),
      jobTarget: z.boolean(),
      education: z.boolean(),
      work: z.boolean(),
      skills: z.boolean(),
      projects: z.boolean(),
    }),
    sectionRegions: z.record(z.string(), z.enum(['left', 'right'])).default({}),
    twoColumnRatio: z.number().min(1).max(3).default(1.6),
    showTechIcons: z.boolean().default(true),
    showProfileIcons: z.boolean().default(true),
    backgroundPattern: z.enum(['none', 'wave']).default('none'),
    borderPattern: z.enum(['none', 'line', 'double', 'corner', 'left-accent']).default('none'),
    presets: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        sectionOrder: z.array(
          z.enum(['profile', 'jobTarget', 'education', 'work', 'skills', 'projects']),
        ),
        sectionVisibility: z.object({
          profile: z.boolean(),
          jobTarget: z.boolean(),
          education: z.boolean(),
          work: z.boolean(),
          skills: z.boolean(),
          projects: z.boolean(),
        }),
        sectionRegions: z.record(z.string(), z.enum(['left', 'right'])).default({}),
        twoColumnRatio: z.number().min(1).max(3),
        showTechIcons: z.boolean().default(true),
        showProfileIcons: z.boolean().default(true),
      }),
    ).default([]),
  }),
});

export type ResumeInput = z.infer<typeof resumeSchema>;
