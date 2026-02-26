import type { IconType } from 'react-icons';
import { FiGithub, FiMail, FiMapPin, FiPhone, FiUser } from 'react-icons/fi';
import type { ResumeTemplateProps } from './ResumeTemplateRenderer';
import { reorderByIds } from '../../shared/utils/order';
import { SiWechat } from 'react-icons/si';
import { Icon } from '@iconify/react';
import { getTechIcon, splitTechValues } from './techIcons';

const sectionTitleMap: Record<string, string> = {
  profile: '个人信息',
  jobTarget: '求职意向',
  education: '教育经历',
  work: '工作经历',
  skills: '技能特长',
  projects: '项目经历',
};

const hasText = (value: string): boolean => value.trim().length > 0;

const TechBadge = ({ label, showIcon }: { label: string; showIcon: boolean }) => {
  const iconName = getTechIcon(label);
  return (
    <span className="tech-badge" title={label}>
      {showIcon && iconName && <Icon icon={iconName} width={13} height={13} />}
      <span>{label}</span>
    </span>
  );
};

const TechBadgeList = ({ values, showIcons }: { values: string[]; showIcons: boolean }) => (
  <div className="tech-badge-list">
    {values.map((value, index) => (
      <TechBadge key={`${value}-${index}`} label={value} showIcon={showIcons} />
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
      {hasText(subtitle) && <p>{subtitle}</p>}
    </div>
    {avatar && <img className="resume-avatar" src={avatar} alt="头像" />}
  </div>
);

export const renderSectionContent = (
  key: string,
  resume: ResumeTemplateProps['resume'],
  sectionItemsOrder: Record<string, string[]>,
  showTechIcons: boolean,
  showProfileIcons: boolean,
) => {
  const LabelWithIcon = ({
    icon: Icon,
    label,
    value,
  }: {
    icon: IconType;
    label: string;
    value: string;
  }) => {
    if (!hasText(value)) {
      return null;
    }
    return (
      <span className="contact-line">
        {showProfileIcons && <Icon className="contact-line-icon" />}
        <span>{label}：{value}</span>
      </span>
    );
  };

  switch (key) {
    case 'profile':
      return (
        <div className="line-grid">
          <LabelWithIcon icon={FiUser} label="姓名" value={resume.profile.name} />
          <LabelWithIcon icon={FiPhone} label="电话" value={resume.profile.phone} />
          <LabelWithIcon icon={FiMail} label="邮箱" value={resume.profile.email} />
          <LabelWithIcon icon={SiWechat} label="微信" value={resume.profile.wechat} />
          <LabelWithIcon icon={FiGithub} label="GitHub" value={resume.profile.github} />
          <LabelWithIcon icon={FiMapPin} label="城市" value={resume.profile.city} />
          {hasText(resume.profile.summary) && (
            <p className="line-grid-full">个人总结：{resume.profile.summary}</p>
          )}
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
          <TechBadgeList values={splitTechValues(item.content)} showIcons={showTechIcons} />
        </article>
      ));
    case 'projects':
      return reorderByIds(resume.projects, sectionItemsOrder.projects ?? []).map((item) => (
        <article key={item.id} className="entry">
          <strong>{item.name} - {item.role}</strong>
          <div>{item.period}</div>
          <TechBadgeList values={item.techStack} showIcons={showTechIcons} />
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
