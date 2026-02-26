import type { LayoutState, Resume, SectionType } from './types';
import { SCHEMA_VERSION } from './types';

const defaultSectionOrder: SectionType[] = [
  'profile',
  'jobTarget',
  'education',
  'work',
  'skills',
  'projects',
];

const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const createDefaultLayout = (): LayoutState => ({
  sectionOrder: [...defaultSectionOrder],
  sectionItemsOrder: {
    education: [],
    work: [],
    skills: [],
    projects: [],
  },
  sectionVisibility: {
    profile: true,
    jobTarget: true,
    education: true,
    work: true,
    skills: true,
    projects: true,
  },
  sectionRegions: {
    profile: 'left',
    jobTarget: 'left',
    skills: 'left',
    education: 'right',
    work: 'right',
    projects: 'right',
  },
  twoColumnRatio: 1.6,
  showTechIcons: true,
  showProfileIcons: true,
  backgroundPattern: 'none',
  borderPattern: 'none',
  presets: [],
});

export const createDefaultResume = (title = '未命名简历'): Resume => {
  const now = Date.now();
  const resume: Resume = {
    id: newId(),
    title,
    templateId: 'minimal',
    schemaVersion: SCHEMA_VERSION,
    updatedAt: now,
    profile: {
      avatar: '',
      name: '',
      phone: '',
      email: '',
      wechat: '',
      github: '',
      city: '',
      summary: '',
    },
    jobTarget: {
      title: '',
      direction: '',
      years: '',
      salaryExpectation: '',
    },
    education: [
      {
        id: newId(),
        school: '',
        degree: '',
        major: '',
        period: '',
        highlights: '',
      },
    ],
    work: [
      {
        id: newId(),
        company: '',
        role: '',
        period: '',
        description: '',
      },
    ],
    skills: [
      {
        id: newId(),
        category: '技术栈',
        content: '',
      },
    ],
    projects: [
      {
        id: newId(),
        name: '',
        role: '',
        period: '',
        techStack: [],
        description: '',
        highlights: [],
        metrics: [],
      },
    ],
    layout: createDefaultLayout(),
  };

  resume.layout.sectionItemsOrder.education = resume.education.map((item) => item.id);
  resume.layout.sectionItemsOrder.work = resume.work.map((item) => item.id);
  resume.layout.sectionItemsOrder.skills = resume.skills.map((item) => item.id);
  resume.layout.sectionItemsOrder.projects = resume.projects.map((item) => item.id);

  return resume;
};

export const createDebugResume = (title = '调试简历'): Resume => {
  const resume = createDefaultResume(title);
  const educationId = resume.education[0]?.id ?? newId();
  const workId = resume.work[0]?.id ?? newId();
  const skillsId = resume.skills[0]?.id ?? newId();
  const projectId = resume.projects[0]?.id ?? newId();

  const next: Resume = {
    ...resume,
    title,
    templateId: 'professional',
    profile: {
      avatar: '',
      name: '张三',
      phone: '13800138000',
      email: 'zhangsan@example.com',
      wechat: 'zhangsan_wechat',
      github: 'github.com/zhangsan',
      city: '上海',
      summary: '5年全栈开发经验，擅长构建高可用业务系统与工程化优化。',
    },
    jobTarget: {
      title: '高级前端工程师',
      direction: 'Web前端',
      years: '5年',
      salaryExpectation: '30k-40k',
    },
    education: [
      {
        id: educationId,
        school: '同济大学',
        degree: '本科',
        major: '软件工程',
        period: '2015-09 ~ 2019-06',
        highlights: '主修数据结构、操作系统、编译原理，GPA 3.6/4.0',
      },
    ],
    work: [
      {
        id: workId,
        company: '某科技公司',
        role: '前端负责人',
        period: '2021-03 ~ 至今',
        description: '负责中后台与低代码平台建设，推动模块化架构和性能优化。',
      },
    ],
    skills: [
      {
        id: skillsId,
        category: '技术栈',
        content: 'TypeScript, React, Node.js, Vite, Zustand, Playwright',
      },
    ],
    projects: [
      {
        id: projectId,
        name: '营销投放平台',
        role: '技术负责人',
        period: '2023-01 ~ 2024-08',
        techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
        description: '从0到1搭建投放管理平台，支持多渠道素材配置与实时数据看板。',
        highlights: ['首屏渲染耗时降低45%', '关键页面交互耗时降低30%'],
        metrics: ['月活提升至2.1万', '人效提升约40%'],
      },
    ],
    layout: {
      ...resume.layout,
      backgroundPattern: 'wave',
      borderPattern: 'line',
      sectionItemsOrder: {
        education: [educationId],
        work: [workId],
        skills: [skillsId],
        projects: [projectId],
      },
    },
  };

  return next;
};

export const touchResume = (resume: Resume): Resume => ({
  ...resume,
  updatedAt: Date.now(),
});
