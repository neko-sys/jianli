import type { ResumeTemplateProps } from './ResumeTemplateRenderer';
import { renderSectionContent, renderTitle, ResumeHeaderIdentity } from './templateHelpers';

export const TwoColumnTemplate = ({
  resume,
  sectionOrder,
  sectionItemsOrder,
  sectionRegions,
  twoColumnRatio,
}: ResumeTemplateProps) => {
  const left = sectionOrder.filter((section) => (sectionRegions[section] ?? 'right') === 'left');
  const right = sectionOrder.filter((section) => (sectionRegions[section] ?? 'right') === 'right');

  return (
    <div className="resume-template two-column-template">
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
              <h2>{renderTitle(section)}</h2>
              <div>{renderSectionContent(section, resume, sectionItemsOrder)}</div>
            </section>
          ))}
        </div>
        <div>
          {right.map((section) => (
            <section key={section} className="resume-section">
              <h2>{renderTitle(section)}</h2>
              <div>{renderSectionContent(section, resume, sectionItemsOrder)}</div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};
