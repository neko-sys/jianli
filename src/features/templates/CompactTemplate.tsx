import type { ResumeTemplateProps } from './ResumeTemplateRenderer';
import { getSectionTitleStyle, renderSectionContent, renderTitle, ResumeHeaderIdentity } from './templateHelpers';

export const CompactTemplate = ({ resume, sectionOrder, sectionItemsOrder, className }: ResumeTemplateProps & { className?: string }) => (
  <div className={`resume-template compact-template ${className ?? ''}`.trim()}>
    <header className="resume-header compact-header">
      <ResumeHeaderIdentity
        name={resume.profile.name || resume.title}
        subtitle={resume.jobTarget.title}
        avatar={resume.profile.avatar}
      />
      <div className="compact-contact">
        {resume.profile.phone.trim() && <span>{resume.profile.phone}</span>}
        {resume.profile.email.trim() && <span>{resume.profile.email}</span>}
        {resume.profile.wechat.trim() && <span>微信：{resume.profile.wechat}</span>}
        {resume.profile.github.trim() && <span>{resume.profile.github}</span>}
        {resume.profile.city.trim() && <span>{resume.profile.city}</span>}
      </div>
    </header>

    <div className="compact-grid">
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
  </div>
);
