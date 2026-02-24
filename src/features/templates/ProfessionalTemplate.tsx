import type { ResumeTemplateProps } from './ResumeTemplateRenderer';
import { renderSectionContent, renderTitle, ResumeHeaderIdentity } from './templateHelpers';

export const ProfessionalTemplate = ({ resume, sectionOrder, sectionItemsOrder }: ResumeTemplateProps) => (
  <div className="resume-template professional-template">
    <header className="resume-header">
      <ResumeHeaderIdentity
        name={resume.profile.name || resume.title}
        subtitle={`${resume.jobTarget.title} | ${resume.jobTarget.direction}`}
        avatar={resume.profile.avatar}
      />
      <div className="contact">
        <span>{resume.profile.phone}</span>
        <span>{resume.profile.email}</span>
        <span>{resume.profile.city}</span>
      </div>
    </header>
    {sectionOrder.map((section) => (
      <section key={section} className="resume-section">
        <h2>{renderTitle(section)}</h2>
        <div>{renderSectionContent(section, resume, sectionItemsOrder)}</div>
      </section>
    ))}
  </div>
);
