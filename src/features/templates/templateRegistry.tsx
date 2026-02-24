import type { TemplateConfig } from '../../core/domain/types';
import type { ComponentType } from 'react';
import { MinimalTemplate } from './MinimalTemplate';
import { ProfessionalTemplate } from './ProfessionalTemplate';
import { TwoColumnTemplate } from './TwoColumnTemplate';
import { ExecutiveTemplate } from './ExecutiveTemplate';
import { CompactTemplate } from './CompactTemplate';

export const templateRegistry: Array<TemplateConfig & { component: ComponentType<any> }> = [
  {
    id: 'minimal',
    name: '极简黑白',
    supportsTwoColumn: false,
    component: MinimalTemplate,
  },
  {
    id: 'professional',
    name: '专业蓝灰',
    supportsTwoColumn: false,
    component: ProfessionalTemplate,
  },
  {
    id: 'two-column',
    name: '双栏技术风',
    supportsTwoColumn: true,
    component: TwoColumnTemplate,
  },
  {
    id: 'executive',
    name: '深色高管风',
    supportsTwoColumn: false,
    component: ExecutiveTemplate,
  },
  {
    id: 'compact',
    name: '紧凑投递风',
    supportsTwoColumn: false,
    component: CompactTemplate,
  },
];
