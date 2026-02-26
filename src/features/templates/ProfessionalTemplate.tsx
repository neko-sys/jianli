import type { ResumeTemplateProps } from './ResumeTemplateRenderer';
import { getSectionTitleStyle, renderSectionContent, renderTitle, ResumeHeaderIdentity } from './templateHelpers';

export const ProfessionalTemplate = ({ resume, sectionOrder, sectionItemsOrder, className }: ResumeTemplateProps & { className?: string }) => (
  <div className={`resume-template professional-template ${className ?? ''}`.trim()}>
    <header className="resume-header">
      <ResumeHeaderIdentity
        name={resume.profile.name || resume.title}
        subtitle={`${resume.jobTarget.title} | ${resume.jobTarget.direction}`}
        avatar={resume.profile.avatar}
      />
    </header>
    {sectionOrder.map((section) => (
      <section key={section} className="resume-section">
        <h2 style={getSectionTitleStyle(section, resume)}>{renderTitle(section)}</h2>
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
