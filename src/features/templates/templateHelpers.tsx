import type { IconType } from 'react-icons';
import type { ResumeTemplateProps } from './ResumeTemplateRenderer';
import { reorderByIds } from '../../shared/utils/order';
import { getTechIcon, splitTechValues } from './techIcons';

const sectionTitleMap: Record<string, string> = {
  profile: '个人信息',
  jobTarget: '求职意向',
  education: '教育经历',
  work: '工作经历',
  skills: '技能特长',
  projects: '项目经历',
};

const TechBadge = ({ label }: { label: string }) => {
  const Icon = getTechIcon(label) as IconType | undefined;
  return (
    <span className="tech-badge" title={label}>
      {Icon && <Icon />}
      <span>{label}</span>
    </span>
  );
};

const TechBadgeList = ({ values }: { values: string[] }) => (
  <div className="tech-badge-list">
    {values.map((value, index) => (
      <TechBadge key={`${value}-${index}`} label={value} />
    ))}
  </div>
);

export const ResumeHeaderIdentity = ({
  name,
  subtitle,
  avatar,
}: {
  name: string;
  subtitle: string;
  avatar: string;
}) => (
  <div className="resume-identity">
    <div className="resume-identity-text">
      <h1>{name}</h1>
      <p>{subtitle}</p>
    </div>
    {avatar && <img className="resume-avatar" src={avatar} alt="头像" />}
  </div>
);

export const renderSectionContent = (
  key: string,
  resume: ResumeTemplateProps['resume'],
  sectionItemsOrder: Record<string, string[]>,
) => {
  switch (key) {
    case 'profile':
      return (
        <div className="line-grid">
          <span>姓名：{resume.profile.name}</span>
          <span>电话：{resume.profile.phone}</span>
          <span>邮箱：{resume.profile.email}</span>
          <span>城市：{resume.profile.city}</span>
          <p className="line-grid-full">个人总结：{resume.profile.summary}</p>
        </div>
      );
    case 'jobTarget':
      return (
        <div className="line-grid">
          <span>岗位：{resume.jobTarget.title}</span>
          <span>方向：{resume.jobTarget.direction}</span>
          <span>经验：{resume.jobTarget.years}</span>
          <span>期望：{resume.jobTarget.salaryExpectation}</span>
        </div>
      );
    case 'education':
      return reorderByIds(resume.education, sectionItemsOrder.education ?? []).map((item) => (
        <article key={item.id} className="entry">
          <strong>{item.school}</strong>
          <div>{item.degree} / {item.major}</div>
          <div>{item.period}</div>
          <p>{item.highlights}</p>
        </article>
      ));
    case 'work':
      return reorderByIds(resume.work, sectionItemsOrder.work ?? []).map((item) => (
        <article key={item.id} className="entry">
          <strong>{item.company} - {item.role}</strong>
          <div>{item.period}</div>
          <p>{item.description}</p>
        </article>
      ));
    case 'skills':
      return reorderByIds(resume.skills, sectionItemsOrder.skills ?? []).map((item) => (
        <article key={item.id} className="entry">
          <strong>{item.category}</strong>
          <TechBadgeList values={splitTechValues(item.content)} />
        </article>
      ));
    case 'projects':
      return reorderByIds(resume.projects, sectionItemsOrder.projects ?? []).map((item) => (
        <article key={item.id} className="entry">
          <strong>{item.name} - {item.role}</strong>
          <div>{item.period}</div>
          <TechBadgeList values={item.techStack} />
          <p>{item.description}</p>
          {item.highlights.length > 0 && <p>亮点：{item.highlights.join('；')}</p>}
          {item.metrics.length > 0 && <p>成果：{item.metrics.join('；')}</p>}
        </article>
      ));
    default:
      return null;
  }
};

export const renderTitle = (key: string): string => sectionTitleMap[key] ?? key;
