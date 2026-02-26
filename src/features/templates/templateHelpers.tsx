import { useEffect, useState, type CSSProperties } from 'react';
import type { IconType } from 'react-icons';
import { FiCalendar, FiGithub, FiMail, FiMapPin, FiPhone, FiUser, FiUsers } from 'react-icons/fi';
import type { ResumeTemplateProps } from './ResumeTemplateRenderer';
import { reorderByIds } from '../../shared/utils/order';
import { SiWechat } from 'react-icons/si';
import { Icon } from '@iconify/react';
import { getTechIcon, resolveTechIcon, splitTechValues } from './techIcons';
import type { SectionType } from '../../core/domain/types';

const sectionTitleMap: Record<string, string> = {
  profile: '个人信息',
  jobTarget: '求职意向',
  education: '教育经历',
  work: '工作经历',
  skills: '技能特长',
  projects: '项目经历',
};

const hasText = (value: string): boolean => value.trim().length > 0;
const DEFAULT_TECH_ICON = 'mdi:code-tags';
const BULLET_PREFIX_RE = /^[-*•●▪◦]\s+/;

const renderMultilineTextContent = (text: string) => {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return null;
  }

  const useList = lines.length > 1 || lines.some((line) => BULLET_PREFIX_RE.test(line));
  if (!useList) {
    return <p>{lines[0]}</p>;
  }

  const items = lines.map((line) => line.replace(BULLET_PREFIX_RE, ''));
  return (
    <ul className="skill-list">
      {items.map((item, index) => (
        <li key={`${item}-${index}`}>{item}</li>
      ))}
    </ul>
  );
};

const TechBadge = ({ label, showIcon }: { label: string; showIcon: boolean }) => {
  const [iconName, setIconName] = useState<string | undefined>(() => getTechIcon(label));

  useEffect(() => {
    let active = true;
    const immediate = getTechIcon(label);
    setIconName(immediate);
    if (immediate) {
      return () => {
        active = false;
      };
    }

    void resolveTechIcon(label).then((resolved) => {
      if (active) {
        setIconName(resolved);
      }
    });

    return () => {
      active = false;
    };
  }, [label]);

  return (
    <span className="tech-badge" title={label}>
      {showIcon && <Icon icon={iconName ?? DEFAULT_TECH_ICON} width={13} height={13} />}
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
          <LabelWithIcon icon={FiUsers} label="性别" value={resume.profile.gender} />
          <LabelWithIcon icon={FiCalendar} label="年龄" value={resume.profile.age} />
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
          {renderMultilineTextContent(item.highlights)}
        </article>
      ));
    case 'work':
      return reorderByIds(resume.work, sectionItemsOrder.work ?? []).map((item) => (
        <article key={item.id} className="entry">
          <strong>{item.company} - {item.role}</strong>
          <div>{item.period}</div>
          {renderMultilineTextContent(item.description)}
        </article>
      ));
    case 'skills':
      return reorderByIds(resume.skills, sectionItemsOrder.skills ?? []).map((item) => (
        <article key={item.id} className="entry">
          <strong>{item.category}</strong>
          {item.category.includes('技术栈')
            ? <TechBadgeList values={splitTechValues(item.content)} showIcons={showTechIcons} />
            : renderMultilineTextContent(item.content)}
        </article>
      ));
    case 'projects':
      return reorderByIds(resume.projects, sectionItemsOrder.projects ?? []).map((item) => (
        <article key={item.id} className="entry">
          <strong>{item.name} - {item.role}</strong>
          <div>{item.period}</div>
          <TechBadgeList values={item.techStack} showIcons={showTechIcons} />
          {renderMultilineTextContent(item.description)}
          {item.highlights.length > 0 && <p>亮点：{item.highlights.join('；')}</p>}
          {item.metrics.length > 0 && <p>成果：{item.metrics.join('；')}</p>}
        </article>
      ));
    default:
      return null;
  }
  };

export const renderTitle = (key: string): string => sectionTitleMap[key] ?? key;

export const getSectionTitleStyle = (
  section: SectionType,
  resume: ResumeTemplateProps['resume'],
): CSSProperties | undefined => {
  const size = resume.layout.sectionTitleFontSizes?.[section];
  if (typeof size !== 'number' || !Number.isFinite(size)) {
    return undefined;
  }
  return { fontSize: `${size}px` };
};
