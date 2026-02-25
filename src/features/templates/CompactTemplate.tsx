import type { ResumeTemplateProps } from './ResumeTemplateRenderer';
import { renderSectionContent, renderTitle, ResumeHeaderIdentity } from './templateHelpers';

export const CompactTemplate = ({ resume, sectionOrder, sectionItemsOrder, className }: ResumeTemplateProps & { className?: string }) => (
  <div className={`resume-template compact-template ${className ?? ''}`.trim()}>
    <header className="resume-header compact-header">
      <ResumeHeaderIdentity
        name={resume.profile.name || resume.title}
        subtitle={resume.jobTarget.title}
        avatar={resume.profile.avatar}
      />
      <div className="compact-contact">
        <span>{resume.profile.phone}</span>
        <span>{resume.profile.email}</span>
        <span>{resume.profile.city}</span>
      </div>
    </header>

    <div className="compact-grid">
      {sectionOrder.map((section) => (
        <section key={section} className="resume-section">
          <h2>{renderTitle(section)}</h2>
          <div>{renderSectionContent(section, resume, sectionItemsOrder)}</div>
        </section>
      ))}
    </div>
  </div>
);
