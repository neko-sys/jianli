import type { LayoutState, Resume, SectionType } from './types';
import { SCHEMA_VERSION } from './types';

const defaultSectionOrder: SectionType[] = [
  'profile',
  'jobTarget',
  'education',
  'work',
  'skills',
  'projects',
  'certificates',
];

const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const debugAvatarSvg = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='196' viewBox='0 0 140 196'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='%23005f8f'/><stop offset='100%' stop-color='%230ea5e9'/></linearGradient></defs><rect width='140' height='196' fill='url(%23g)'/><circle cx='70' cy='64' r='28' fill='%23eaf6ff'/><rect x='28' y='106' width='84' height='58' rx='29' fill='%23eaf6ff'/><text x='70' y='188' text-anchor='middle' font-family='Arial,sans-serif' font-size='22' fill='%23ffffff'>AI</text></svg>";

export const createDefaultLayout = (): LayoutState => ({
  sectionOrder: [...defaultSectionOrder],
  sectionItemsOrder: {
    education: [],
    work: [],
    skills: [],
    projects: [],
    certificates: [],
  },
  sectionVisibility: {
    profile: true,
    jobTarget: true,
    education: true,
    work: true,
    skills: true,
    projects: true,
    certificates: true,
  },
  sectionRegions: {
    profile: 'left',
    jobTarget: 'left',
    skills: 'left',
    education: 'right',
    work: 'right',
    projects: 'right',
    certificates: 'right',
  },
  twoColumnRatio: 1.6,
  showTechIcons: true,
  showProfileIcons: true,
  sectionTitleFontSizes: {
    profile: 16,
    jobTarget: 16,
    education: 16,
    work: 16,
    skills: 16,
    projects: 16,
    certificates: 16,
  },
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
      gender: '',
      age: '',
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
    certificates: [
      {
        id: newId(),
        name: '',
        issuer: '',
        date: '',
        credentialId: '',
        description: '',
      },
    ],
    layout: createDefaultLayout(),
  };

  resume.layout.sectionItemsOrder.education = resume.education.map((item) => item.id);
  resume.layout.sectionItemsOrder.work = resume.work.map((item) => item.id);
  resume.layout.sectionItemsOrder.skills = resume.skills.map((item) => item.id);
  resume.layout.sectionItemsOrder.projects = resume.projects.map((item) => item.id);
  resume.layout.sectionItemsOrder.certificates = resume.certificates.map((item) => item.id);

  return resume;
};

export const createDebugResume = (title = '调试简历'): Resume => {
  const resume = createDefaultResume(title);
  const educationId = resume.education[0]?.id ?? newId();
  const workId = resume.work[0]?.id ?? newId();
  const skillsId = resume.skills[0]?.id ?? newId();
  const coreAdvantageId = newId();
  const projectId = resume.projects[0]?.id ?? newId();
  const certificateId = resume.certificates[0]?.id ?? newId();

  const next: Resume = {
    ...resume,
    title,
    templateId: 'professional',
    profile: {
      avatar: debugAvatarSvg,
      name: '张三',
      gender: '男',
      age: '28',
      phone: '13800138000',
      email: 'zhangsan@example.com',
      wechat: 'zhangsan_wechat',
      github: 'github.com/zhangsan',
      city: '上海',
      summary: '6年后端与平台研发经验，聚焦 Spring Cloud 微服务治理与 AI 业务落地。',
    },
    jobTarget: {
      title: '资深 Java / AI 平台工程师',
      direction: '后端服务 / AI应用',
      years: '6年',
      salaryExpectation: '35k-50k',
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
        company: '某智能科技公司',
        role: '后端技术负责人',
        period: '2021-03 ~ 至今',
        description: '• 主导 Spring Cloud 微服务拆分与治理，建立统一网关、配置中心与链路追踪\n• 搭建 AI 能力平台（RAG + Agent），支撑客服、运营分析等核心场景\n• 推进容器化与可观测体系建设，显著提升系统稳定性与交付效率',
      },
    ],
    skills: [
      {
        id: skillsId,
        category: '技术栈',
        content: 'Java, Spring Boot, Spring Cloud Alibaba, MySQL, Redis, Kafka, Elasticsearch, Docker, Kubernetes, LangChain4j',
      },
      {
        id: coreAdvantageId,
        category: '核心优势',
        content: '• 微服务架构设计与治理（注册发现、熔断限流、灰度发布）\n• AI 应用工程化落地（知识库检索、Prompt 编排、效果评估）\n• 高并发性能优化与稳定性建设（容量评估、故障演练、可观测闭环）',
      },
    ],
    projects: [
      {
        id: projectId,
        name: '企业级智能客服与知识库平台',
        role: '架构负责人',
        period: '2023-01 ~ 2024-08',
        techStack: ['Java', 'Spring Cloud', 'MySQL', 'Redis', 'Kafka', 'Milvus', 'LangChain4j'],
        description: '• 构建多租户知识库检索系统，支持文档切片、向量化与召回重排\n• 设计 Agent 工作流，接入工单、CRM、FAQ，实现自动问答与辅助决策\n• 建立推理网关与缓存策略，降低模型调用成本并提升响应稳定性',
        highlights: ['RAG 命中率提升至 85%+', '平均响应时延下降 38%'],
        metrics: ['客服人工转接率下降 27%', '月均节省人力成本约 32 万'],
      },
    ],
    certificates: [
      {
        id: certificateId,
        name: '阿里云 ACA 云原生工程师',
        issuer: '阿里云',
        date: '2024-05',
        credentialId: 'ACA-CN-2024-001952',
        description: '覆盖 Kubernetes 集群运维、微服务部署发布与可观测体系实践。',
      },
    ],
    layout: {
      ...resume.layout,
      backgroundPattern: 'none',
      borderPattern: 'none',
      sectionItemsOrder: {
        education: [educationId],
        work: [workId],
        skills: [skillsId, coreAdvantageId],
        projects: [projectId],
        certificates: [certificateId],
      },
    },
  };

  return next;
};

export const touchResume = (resume: Resume): Resume => ({
  ...resume,
  updatedAt: Date.now(),
});
