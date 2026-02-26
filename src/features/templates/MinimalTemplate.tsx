import type { ResumeTemplateProps } from './ResumeTemplateRenderer';
import { renderSectionContent, renderTitle, ResumeHeaderIdentity } from './templateHelpers';

export const MinimalTemplate = ({ resume, sectionOrder, sectionItemsOrder, className }: ResumeTemplateProps & { className?: string }) => (
  <div className={`resume-template minimal-template ${className ?? ''}`.trim()}>
    <header className="resume-header">
      <ResumeHeaderIdentity
        name={resume.profile.name || resume.title}
        subtitle={resume.jobTarget.title}
        avatar={resume.profile.avatar}
      />
    </header>
    {sectionOrder.map((section) => (
      <section key={section} className="resume-section">
        <h2>{renderTitle(section)}</h2>
        <div>{renderSectionContent(
          section,
          resume,
          sectionItemsOrder,
          resume.layout.showTechIcons,
          resume.layout.showProfileIcons,
        )}</div>
      </section>
    ))}
  </div>
);
