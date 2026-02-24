import type { Resume, SectionRegion, SectionType } from '../../core/domain/types';
import { templateRegistry } from './templateRegistry';

export interface ResumeTemplateProps {
  resume: Resume;
  sectionOrder: SectionType[];
  sectionItemsOrder: Record<string, string[]>;
  sectionRegions: Partial<Record<SectionType, SectionRegion>>;
  twoColumnRatio: number;
}

export const ResumeTemplateRenderer = ({
  templateId,
  props,
}: {
  templateId: string;
  props: ResumeTemplateProps;
}) => {
  const target = templateRegistry.find((item) => item.id === templateId) ?? templateRegistry[0];
  const Component = target.component;
  return <Component {...props} />;
};
