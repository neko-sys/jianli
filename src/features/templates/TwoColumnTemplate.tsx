import type { ResumeTemplateProps } from './ResumeTemplateRenderer';
import { getSectionTitleStyle, renderSectionContent, renderTitle, ResumeHeaderIdentity } from './templateHelpers';

export const TwoColumnTemplate = ({
  resume,
  sectionOrder,
  sectionItemsOrder,
  sectionRegions,
  twoColumnRatio,
  className,
}: ResumeTemplateProps & { className?: string }) => {
  const left = sectionOrder.filter((section) => (sectionRegions[section] ?? 'right') === 'left');
  const right = sectionOrder.filter((section) => (sectionRegions[section] ?? 'right') === 'right');

  return (
    <div className={`resume-template two-column-template ${className ?? ''}`.trim()}>
      <header className="resume-header">
        <ResumeHeaderIdentity
          name={resume.profile.name || resume.title}
          subtitle={resume.jobTarget.title}
          avatar={resume.profile.avatar}
        />
      </header>
      <div className="columns" style={{ gridTemplateColumns: `1fr ${twoColumnRatio}fr` }}>
        <div>
          {left.map((section) => (
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
        <div>
          {right.map((section) => (
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
    </div>
  );
};
