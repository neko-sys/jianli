import type { ResumeTemplateProps } from './ResumeTemplateRenderer';
import { renderSectionContent, renderTitle, ResumeHeaderIdentity } from './templateHelpers';

export const ExecutiveTemplate = ({ resume, sectionOrder, sectionItemsOrder, className }: ResumeTemplateProps & { className?: string }) => (
  <div className={`resume-template executive-template ${className ?? ''}`.trim()}>
    <header className="resume-header">
      <ResumeHeaderIdentity
        name={resume.profile.name || resume.title}
        subtitle={`${resume.jobTarget.title} · ${resume.jobTarget.direction}`}
        avatar={resume.profile.avatar}
      />
      <div className="executive-summary">{resume.profile.summary}</div>
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
