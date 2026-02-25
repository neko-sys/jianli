import * as React from 'react';
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
  const backgroundClassMap = {
    none: '',
    wave: 'resume-bg-wave',
  } as const;
  const borderClassMap = {
    none: '',
    line: 'resume-border-line',
    double: 'resume-border-double',
    corner: 'resume-border-corner',
    'left-accent': 'resume-border-left-accent',
  } as const;
  const backgroundClass = backgroundClassMap[props.resume.layout.backgroundPattern];
  const borderClass = borderClassMap[props.resume.layout.borderPattern];
  const rendered = <Component {...props} />;

  if ((!backgroundClass && !borderClass) || !React.isValidElement(rendered)) {
    return rendered;
  }

  const existingClassName = (rendered.props as { className?: string }).className ?? '';
  const className = `${existingClassName} ${backgroundClass} ${borderClass}`.trim();
  return React.cloneElement(rendered, { className });
};
