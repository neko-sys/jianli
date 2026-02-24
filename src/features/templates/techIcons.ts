import type { IconType } from 'react-icons';
import {
  SiVuedotjs,
  SiReact,
  SiTypescript,
  SiJavascript,
  SiNodedotjs,
  SiNestjs,
  SiVite,
  SiDocker,
  SiKubernetes,
  SiMysql,
  SiPostgresql,
  SiRedis,
  SiSpring,
  SiPython,
  SiGo,
  SiNginx,
  SiGithub,
} from 'react-icons/si';

const ICON_MAP: Record<string, IconType> = {
  vue: SiVuedotjs,
  'vue.js': SiVuedotjs,
  react: SiReact,
  typescript: SiTypescript,
  ts: SiTypescript,
  javascript: SiJavascript,
  js: SiJavascript,
  node: SiNodedotjs,
  nodejs: SiNodedotjs,
  'node.js': SiNodedotjs,
  nest: SiNestjs,
  nestjs: SiNestjs,
  vite: SiVite,
  pinia: SiVuedotjs,
  docker: SiDocker,
  kubernetes: SiKubernetes,
  k8s: SiKubernetes,
  mysql: SiMysql,
  postgresql: SiPostgresql,
  postgres: SiPostgresql,
  redis: SiRedis,
  spring: SiSpring,
  python: SiPython,
  go: SiGo,
  golang: SiGo,
  nginx: SiNginx,
  github: SiGithub,
};

const normalize = (value: string): string =>
  value
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/_/g, '')
    .trim();

export const getTechIcon = (label: string): IconType | undefined => ICON_MAP[normalize(label)];

export const splitTechValues = (text: string): string[] =>
  text
    .split(/[，,\/|·\s]+/)
    .map((item) => item.trim())
    .filter(Boolean);
