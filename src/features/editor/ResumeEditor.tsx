import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import dayjs from 'dayjs';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import type { Resume, SectionType } from '../../core/domain/types';
import { Button } from '../../shared/ui/Button';
import { Card } from '../../shared/ui/Card';
import { Checkbox } from '../../shared/ui/Checkbox';
import { Input } from '../../shared/ui/Input';
import { Label } from '../../shared/ui/Label';
import { Select } from '../../shared/ui/Select';
import { Textarea } from '../../shared/ui/Textarea';
import { SortableList } from './SortableList';
import { templateRegistry } from '../templates/templateRegistry';
import { PaginatedResumeRenderer } from '../templates/PaginatedResumeRenderer';
import { polishProjectDescription } from '../../core/ai/resumePolishService';
import { useSettingsStore } from '../../store/useSettingsStore';
import { applyLayoutConstraints } from '../../core/domain/layoutConstraints';

interface EditorProps {
  resume: Resume;
  onChange: (next: Resume) => void;
  onExportJson: () => void;
  onDownloadPdf: (previewElement: HTMLElement) => Promise<void> | void;
}

const sectionText: Record<SectionType, string> = {
  profile: '个人信息',
  jobTarget: '求职意向',
  education: '教育经历',
  work: '工作经历',
  skills: '技能特长',
  projects: '项目经历',
};

const presetOptions = {
  city: ['北京', '上海', '深圳', '广州', '杭州', '成都', '武汉', '西安', '南京', '苏州'],
  jobTitle: ['前端开发工程师', '后端开发工程师', '全栈工程师', 'Java工程师', '测试开发工程师', '算法工程师', '产品经理', '项目经理'],
  jobDirection: ['Web前端', '后端服务', '全栈开发', '数据分析', '人工智能', '测试开发', '移动端开发', '运维开发'],
  years: ['应届', '1年', '2年', '3年', '5年', '8年', '10年+'],
  salary: ['8k-12k', '12k-20k', '20k-30k', '30k-50k', '面议'],
  degree: ['大专', '本科', '硕士', '博士'],
  skillCategory: ['技术栈', '核心优势', '编程语言', '前端框架', '后端框架', '数据库', 'DevOps', '云服务'],
  workRole: ['前端工程师', '后端工程师', '全栈工程师', '测试工程师', '项目经理', '架构师'],
  projectRole: ['负责人', '核心开发', '前端负责人', '后端负责人', '测试负责人', '项目经理'],
};

const styleOptions = [
  { key: 'clean', name: '纯净留白', backgroundPattern: 'none', borderPattern: 'none' },
  { key: 'wave-line', name: '大波浪细线框', backgroundPattern: 'wave', borderPattern: 'line' },
  { key: 'wave-corner', name: '大波浪角标框', backgroundPattern: 'wave', borderPattern: 'corner' },
  { key: 'wave-double', name: '大波浪双线框', backgroundPattern: 'wave', borderPattern: 'double' },
  { key: 'clean-accent', name: '留白强调框', backgroundPattern: 'none', borderPattern: 'left-accent' },
] as const;

const normalizeMonth = (value: string): string => {
  const match = value.match(/^(\d{4})[-/.](\d{1,2})$/);
  if (!match) {
    return '';
  }
  const year = match[1];
  const month = Number(match[2]);
  if (month < 1 || month > 12) {
    return '';
  }
  return `${year}-${String(month).padStart(2, '0')}`;
};

const parsePeriod = (value: string): { start: string; end: string; ongoing: boolean } => {
  const ongoing = /至今|present|current/i.test(value);
  const parts = value.match(/\d{4}[-/.]\d{1,2}/g) ?? [];
  return {
    start: parts[0] ? normalizeMonth(parts[0]) : '',
    end: parts[1] ? normalizeMonth(parts[1]) : '',
    ongoing,
  };
};

const formatPeriod = (start: string, end: string, ongoing: boolean): string => {
  if (!start && !end && !ongoing) {
    return '';
  }
  if (ongoing) {
    return start ? `${start} ~ 至今` : '至今';
  }
  if (start && end) {
    return `${start} ~ ${end}`;
  }
  return start || end;
};

const createItemId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

const resolveStyleKey = (resume: Resume): string => {
  const found = styleOptions.find(
    (item) =>
      item.backgroundPattern === resume.layout.backgroundPattern &&
      item.borderPattern === resume.layout.borderPattern,
  );
  return found?.key ?? 'clean';
};

const safeGetLocalStorageFlag = (key: string): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  return window.localStorage.getItem(key) === '1';
};

const parseTechStack = (value: string): string[] =>
  value
    .split(/[，,]/)
    .map((item) => item.trim())
    .filter(Boolean);

const formatTechStack = (values: string[]): string => values.join(', ');
const clampTitleFontSize = (value: number): number => Math.min(24, Math.max(12, value));
const titleSizeSections: SectionType[] = ['profile', 'jobTarget', 'education', 'work', 'skills', 'projects'];

export const ResumeEditor = ({ resume, onChange, onExportJson, onDownloadPdf }: EditorProps) => {
  const [aiLoadingId, setAiLoadingId] = useState<string>('');
  const [aiError, setAiError] = useState<string>('');
  const [pdfError, setPdfError] = useState<string>('');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [presetName, setPresetName] = useState<string>('');
  const [compactMode, setCompactMode] = useState<boolean>(() => safeGetLocalStorageFlag('editor-compact-mode'));
  const [leftTwoCol, setLeftTwoCol] = useState<boolean>(() => safeGetLocalStorageFlag('editor-left-two-col'));
  const [previewPage, setPreviewPage] = useState<number>(1);
  const [previewPages, setPreviewPages] = useState<number>(1);
  const previewRef = useRef<HTMLDivElement>(null);
  const ollama = useSettingsStore((state) => state.ollama);

  const sections = useMemo(() => resume.layout.sectionOrder, [resume.layout.sectionOrder]);
  const visibleSections = useMemo(
    () => resume.layout.sectionOrder.filter((section) => resume.layout.sectionVisibility[section]),
    [resume.layout.sectionOrder, resume.layout.sectionVisibility],
  );
  const selectedStyleKey = useMemo(() => resolveStyleKey(resume), [resume]);

  const updateResume = (patch: Partial<Resume>) => {
    onChange({ ...resume, ...patch });
  };

  const updateLayout = (patch: Partial<Resume['layout']>) => {
    const constrained = applyLayoutConstraints({
      ...resume.layout,
      ...patch,
    });
    updateResume({
      layout: constrained,
    });
  };

  const updateSectionOrder = (next: SectionType[]) => {
    const normalized = [
      'profile' as SectionType,
      ...next.filter((item) => item !== 'profile'),
    ];
    updateLayout({ sectionOrder: normalized });
  };

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem('editor-compact-mode', compactMode ? '1' : '0');
  }, [compactMode]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem('editor-left-two-col', leftTwoCol ? '1' : '0');
  }, [leftTwoCol]);

  const syncPreviewPagination = useCallback(() => {
    const container = previewRef.current;
    if (!container) {
      setPreviewPage(1);
      setPreviewPages(1);
      return;
    }
    const pages = Array.from(container.querySelectorAll<HTMLElement>('.resume-page'));
    if (pages.length === 0) {
      setPreviewPage(1);
      setPreviewPages(1);
      return;
    }
    const containerRect = container.getBoundingClientRect();
    let current = 1;
    pages.forEach((page, index) => {
      const rect = page.getBoundingClientRect();
      if (rect.top - containerRect.top <= 24) {
        current = index + 1;
      }
    });
    const total = pages.length;
    setPreviewPage((prev) => (prev === current ? prev : current));
    setPreviewPages((prev) => (prev === total ? prev : total));
  }, []);

  useEffect(() => {
    const container = previewRef.current;
    if (!container) {
      return;
    }

    const updatePagination = () => {
      requestAnimationFrame(syncPreviewPagination);
    };

    const updateLayoutAndPagination = () => requestAnimationFrame(syncPreviewPagination);

    const resizeObserver = typeof ResizeObserver === 'undefined'
      ? null
      : new ResizeObserver(updateLayoutAndPagination);
    const mutationObserver = typeof MutationObserver === 'undefined'
      ? null
      : new MutationObserver(updateLayoutAndPagination);

    container.addEventListener('scroll', updatePagination, { passive: true });
    window.addEventListener('resize', updateLayoutAndPagination);
    resizeObserver?.observe(container);
    mutationObserver?.observe(container, { childList: true, subtree: true });

    updateLayoutAndPagination();

    return () => {
      container.removeEventListener('scroll', updatePagination);
      window.removeEventListener('resize', updateLayoutAndPagination);
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
    };
  }, [syncPreviewPagination]);

  useEffect(() => {
    requestAnimationFrame(syncPreviewPagination);
  }, [resume, syncPreviewPagination]);

  const uploadAvatar = async (file?: File): Promise<void> => {
    if (!file) {
      return;
    }
    const reader = new FileReader();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(String(reader.result ?? ''));
      reader.onerror = () => reject(new Error('头像读取失败'));
      reader.readAsDataURL(file);
    });
    updateResume({
      profile: {
        ...resume.profile,
        avatar: dataUrl,
      },
    });
  };

  return (
    <div className={`editor-layout ${compactMode ? 'compact-mode' : ''}`}>
      <div className={`editor-panel ${leftTwoCol ? 'two-col' : ''}`}>
        <Card
          title="基础操作"
          className="full-span"
          actions={
            <div className="row-actions">
              <Button variant="secondary" onClick={onExportJson}>导出 JSON</Button>
              <Button
                onClick={async () => {
                  const target =
                    previewRef.current?.querySelector('.resume-paginated-root') ??
                    previewRef.current?.querySelector('.resume-template');
                  if (!(target instanceof HTMLElement) || pdfLoading) {
                    return;
                  }
                  setPdfError('');
                  setPdfLoading(true);
                  try {
                    await onDownloadPdf(target);
                  } catch (error) {
                    setPdfError(error instanceof Error ? error.message : 'PDF 导出失败');
                  } finally {
                    setPdfLoading(false);
                  }
                }}
              >
                {pdfLoading ? '导出中...' : '导出 PDF'}
              </Button>
            </div>
          }
        >
          <Label>简历标题</Label>
          <Input
            value={resume.title}
            onChange={(event) => updateResume({ title: event.target.value })}
          />
          <Label>模板</Label>
          <Select
            value={resume.templateId}
            onChange={(event) => updateResume({ templateId: event.target.value })}
          >
            <option value="" disabled>选择简历模板</option>
            {templateRegistry.map((template) => (
              <option value={template.id} key={template.id}>{template.name}</option>
            ))}
          </Select>
          <div className="mode-switches">
            <Label className="inline-check">
              <Checkbox
                checked={compactMode}
                onChange={(event) => setCompactMode(event.target.checked)}
              />
              紧凑模式
            </Label>
            <Label className="inline-check">
              <Checkbox
                checked={leftTwoCol}
                onChange={(event) => setLeftTwoCol(event.target.checked)}
              />
              左栏双列
            </Label>
          </div>
        </Card>

        <Card title="模块顺序拖拽" className="full-span">
          <SortableList
            items={sections}
            getId={(item) => item}
            onReorder={(next) => updateSectionOrder(next)}
            itemClassName="sortable-item"
            render={(section) => <div>{sectionText[section]}</div>}
          />
        </Card>

        <Card title="个人信息">
          <Label>头像</Label>
          <div className="avatar-row">
            {resume.profile.avatar ? (
              <img src={resume.profile.avatar} alt="头像预览" className="avatar-preview" />
            ) : (
              <div className="avatar-placeholder">无头像</div>
            )}
            <div className="row-actions">
              <Button variant="secondary" className="file-btn" component="label">
                上传头像
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => void uploadAvatar(event.target.files?.[0])}
                />
              </Button>
              {resume.profile.avatar && (
                <Button
                  type="button"
                  variant="danger"
                  onClick={() =>
                    updateResume({
                      profile: {
                        ...resume.profile,
                        avatar: '',
                      },
                    })
                  }
                >
                  移除头像
                </Button>
              )}
            </div>
          </div>

          <Label>姓名</Label>
          <Input value={resume.profile.name} onChange={(e) => updateResume({ profile: { ...resume.profile, name: e.target.value } })} />
          <Label>电话</Label>
          <Input
            type="tel"
            inputMode="tel"
            placeholder="例如：13800138000"
            value={resume.profile.phone}
            onChange={(e) => updateResume({ profile: { ...resume.profile, phone: e.target.value } })}
          />
          <Label>性别</Label>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={resume.profile.gender || null}
            onChange={(_, nextValue: string | null) => {
              updateResume({ profile: { ...resume.profile, gender: nextValue ?? '' } });
            }}
            aria-label="性别"
          >
            <ToggleButton value="男">男</ToggleButton>
            <ToggleButton value="女">女</ToggleButton>
          </ToggleButtonGroup>
          <Label>年龄</Label>
          <Input
            type="number"
            min={0}
            max={120}
            step={1}
            inputMode="numeric"
            placeholder="例如：28"
            value={resume.profile.age}
            onChange={(e) => updateResume({ profile: { ...resume.profile, age: e.target.value } })}
          />
          <Label>邮箱</Label>
          <Input
            type="email"
            inputMode="email"
            placeholder="例如：name@example.com"
            value={resume.profile.email}
            onChange={(e) => updateResume({ profile: { ...resume.profile, email: e.target.value } })}
          />
          <Label>微信</Label>
          <Input
            placeholder="例如：wechat_id"
            value={resume.profile.wechat}
            onChange={(e) => updateResume({ profile: { ...resume.profile, wechat: e.target.value } })}
          />
          <Label>GitHub</Label>
          <Input
            placeholder="例如：github.com/username"
            value={resume.profile.github}
            onChange={(e) => updateResume({ profile: { ...resume.profile, github: e.target.value } })}
          />
          <Label>城市</Label>
          <Select
            value={resume.profile.city}
            onChange={(e) => updateResume({ profile: { ...resume.profile, city: e.target.value } })}
          >
            <option value="">请选择城市</option>
            {presetOptions.city.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </Select>
          <Label>个人总结</Label>
          <Textarea value={resume.profile.summary} onChange={(e) => updateResume({ profile: { ...resume.profile, summary: e.target.value } })} />
        </Card>

        <Card title="求职意向">
          <Label>目标岗位</Label>
          <Input
            list="preset-job-title"
            value={resume.jobTarget.title}
            onChange={(e) => updateResume({ jobTarget: { ...resume.jobTarget, title: e.target.value } })}
          />
          <Label>技术方向</Label>
          <Input
            list="preset-job-direction"
            value={resume.jobTarget.direction}
            onChange={(e) => updateResume({ jobTarget: { ...resume.jobTarget, direction: e.target.value } })}
          />
          <Label>工作年限</Label>
          <Input
            type="number"
            min={0}
            max={50}
            step={1}
            inputMode="numeric"
            value={resume.jobTarget.years.replace(/[^\d]/g, '')}
            onChange={(e) =>
              updateResume({
                jobTarget: {
                  ...resume.jobTarget,
                  years: e.target.value ? `${e.target.value}年` : '',
                },
              })
            }
          />
          <Label>薪资期望</Label>
          <Input
            list="preset-salary"
            value={resume.jobTarget.salaryExpectation}
            onChange={(e) => updateResume({ jobTarget: { ...resume.jobTarget, salaryExpectation: e.target.value } })}
          />
        </Card>

        <EditableListSection
          title="教育经历"
          sectionId="education"
          items={resume.education}
          onChange={(next) =>
            updateResume({
              education: next,
              layout: {
                ...resume.layout,
                sectionItemsOrder: {
                  ...resume.layout.sectionItemsOrder,
                  education: next.map((item) => item.id),
                },
              },
            })
          }
          createItem={() => ({ id: createItemId(), school: '', degree: '', major: '', period: '', highlights: '' })}
          renderItem={(item, update) => (
            <>
              <Input placeholder="学校" value={item.school} onChange={(e) => update({ ...item, school: e.target.value })} />
              <Input
                list="preset-degree"
                placeholder="学历"
                value={item.degree}
                onChange={(e) => update({ ...item, degree: e.target.value })}
              />
              <Input placeholder="专业" value={item.major} onChange={(e) => update({ ...item, major: e.target.value })} />
              <PeriodInput value={item.period} onChange={(next) => update({ ...item, period: next })} />
              <Textarea placeholder="补充" value={item.highlights} onChange={(e) => update({ ...item, highlights: e.target.value })} />
            </>
          )}
        />

        <EditableListSection
          title="工作经历"
          sectionId="work"
          items={resume.work}
          onChange={(next) =>
            updateResume({
              work: next,
              layout: {
                ...resume.layout,
                sectionItemsOrder: {
                  ...resume.layout.sectionItemsOrder,
                  work: next.map((item) => item.id),
                },
              },
            })
          }
          createItem={() => ({ id: createItemId(), company: '', role: '', period: '', description: '' })}
          renderItem={(item, update) => (
            <>
              <Input placeholder="公司" value={item.company} onChange={(e) => update({ ...item, company: e.target.value })} />
              <Input
                list="preset-work-role"
                placeholder="岗位"
                value={item.role}
                onChange={(e) => update({ ...item, role: e.target.value })}
              />
              <PeriodInput value={item.period} onChange={(next) => update({ ...item, period: next })} />
              <Textarea placeholder="工作描述" value={item.description} onChange={(e) => update({ ...item, description: e.target.value })} />
            </>
          )}
        />

        <EditableListSection
          title="技能特长"
          sectionId="skills"
          items={resume.skills}
          onChange={(next) =>
            updateResume({
              skills: next,
              layout: {
                ...resume.layout,
                sectionItemsOrder: {
                  ...resume.layout.sectionItemsOrder,
                  skills: next.map((item) => item.id),
                },
              },
            })
          }
          createItem={() => ({ id: createItemId(), category: '技术栈', content: '' })}
          renderItem={(item, update) => (
            <>
              <Select
                value={item.category || ''}
                onChange={(e) => update({ ...item, category: e.target.value })}
              >
                <option value="">请选择分类</option>
                {presetOptions.skillCategory.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
                {item.category && !presetOptions.skillCategory.includes(item.category) && (
                  <option value={item.category}>{item.category}</option>
                )}
              </Select>
              <Textarea
                placeholder="支持多行描述，使用 - 开头可显示圆点列表"
                value={item.content}
                onChange={(e) => update({ ...item, content: e.target.value })}
              />
            </>
          )}
        />

        <EditableListSection
          title="项目经历"
          sectionId="projects"
          items={resume.projects}
          onChange={(next) =>
            updateResume({
              projects: next,
              layout: {
                ...resume.layout,
                sectionItemsOrder: {
                  ...resume.layout.sectionItemsOrder,
                  projects: next.map((item) => item.id),
                },
              },
            })
          }
          createItem={() => ({ id: createItemId(), name: '', role: '', period: '', techStack: [], description: '', highlights: [], metrics: [] })}
          renderItem={(item, update) => (
            <>
              <Input placeholder="项目名" value={item.name} onChange={(e) => update({ ...item, name: e.target.value })} />
              <Input
                list="preset-project-role"
                placeholder="角色"
                value={item.role}
                onChange={(e) => update({ ...item, role: e.target.value })}
              />
              <PeriodInput value={item.period} onChange={(next) => update({ ...item, period: next })} />
              <TechStackInput
                value={item.techStack}
                onChange={(nextTechStack) => update({ ...item, techStack: nextTechStack })}
              />
              <Textarea placeholder="项目描述" value={item.description} onChange={(e) => update({ ...item, description: e.target.value })} />
              <div className="row-actions">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={!item.description || aiLoadingId === item.id}
                  onClick={async () => {
                    setAiError('');
                    setAiLoadingId(item.id);
                    try {
                      const result = await polishProjectDescription(ollama, {
                        text: item.description,
                        jobDirection: resume.jobTarget.direction || 'IT',
                        tone: '专业',
                      });
                      if (result.candidates.length > 0) {
                        update({ ...item, description: result.candidates[0] });
                      }
                    } catch (error) {
                      setAiError(error instanceof Error ? error.message : '润色失败');
                    } finally {
                      setAiLoadingId('');
                    }
                  }}
                >
                  {aiLoadingId === item.id ? '润色中...' : 'AI润色'}
                </Button>
              </div>
            </>
          )}
        />

        <Card title="V2 布局编辑器" className="full-span layout-editor-card">
          <p className="layout-editor-tip">控制模块显示与预设，一键切换常用投递布局。</p>
          <div className="layout-editor-form">
            <Label>页面风格</Label>
            <Select
              value={selectedStyleKey}
              onChange={(event) => {
                const selected = styleOptions.find((item) => item.key === event.target.value);
                if (!selected) {
                  return;
                }
                updateLayout({
                  backgroundPattern: selected.backgroundPattern,
                  borderPattern: selected.borderPattern,
                });
              }}
            >
              {styleOptions.map((item) => (
                <option key={item.key} value={item.key}>{item.name}</option>
              ))}
            </Select>
            <Label className="inline-check">
              <Checkbox
                checked={resume.layout.showTechIcons}
                onChange={(event) =>
                  updateLayout({
                    showTechIcons: event.target.checked,
                  })
                }
              />
              显示技术 Icon
            </Label>
            <Label className="inline-check">
              <Checkbox
                checked={resume.layout.showProfileIcons}
                onChange={(event) =>
                  updateLayout({
                    showProfileIcons: event.target.checked,
                  })
                }
              />
              显示个人信息 Icon
            </Label>
            {titleSizeSections.map((section) => (
              <div key={`title-size-${section}`}>
                <Label>{sectionText[section]}标题字号</Label>
                <Input
                  type="number"
                  min={12}
                  max={24}
                  step={1}
                  value={String(resume.layout.sectionTitleFontSizes?.[section] ?? 16)}
                  onChange={(event) => {
                    const raw = Number(event.target.value);
                    if (!Number.isFinite(raw)) {
                      return;
                    }
                    updateLayout({
                      sectionTitleFontSizes: {
                        ...(resume.layout.sectionTitleFontSizes ?? {}),
                        [section]: clampTitleFontSize(raw),
                      },
                    });
                  }}
                />
              </div>
            ))}
          </div>
          <div className="layout-editor-list">
            {sections.map((section) => (
              <div key={section} className="layout-control-row">
                <strong>{sectionText[section]}</strong>
                <Label className="inline-check">
                  <Checkbox
                    checked={resume.layout.sectionVisibility[section]}
                    disabled={section === 'profile'}
                    onChange={(event) =>
                      updateLayout({
                        sectionVisibility: {
                          ...resume.layout.sectionVisibility,
                          [section]: section === 'profile' ? true : event.target.checked,
                        },
                      })
                    }
                  />
                  显示
                </Label>
              </div>
            ))}
          </div>

          <div className="layout-preset-create">
            <Input
              placeholder="布局预设名称"
              value={presetName}
              onChange={(event) => setPresetName(event.target.value)}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                if (!presetName.trim()) {
                  return;
                }
                updateLayout({
                  presets: [
                    ...resume.layout.presets,
                    {
                      id: `${Date.now()}`,
                      name: presetName.trim(),
                      sectionOrder: [...resume.layout.sectionOrder],
                      sectionVisibility: { ...resume.layout.sectionVisibility },
                      sectionRegions: { ...resume.layout.sectionRegions },
                      twoColumnRatio: resume.layout.twoColumnRatio,
                      showTechIcons: resume.layout.showTechIcons,
                      showProfileIcons: resume.layout.showProfileIcons,
                      sectionTitleFontSizes: { ...(resume.layout.sectionTitleFontSizes ?? {}) },
                    },
                  ],
                });
                setPresetName('');
              }}
            >
              保存预设
            </Button>
          </div>

          <div className="layout-preset-list">
            {resume.layout.presets.map((preset) => (
              <div key={preset.id} className="layout-preset-row">
                <span>{preset.name}</span>
                <div className="row-actions">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() =>
                      updateLayout({
                        sectionOrder: [...preset.sectionOrder],
                        sectionVisibility: { ...preset.sectionVisibility },
                        sectionRegions: { ...preset.sectionRegions },
                        twoColumnRatio: preset.twoColumnRatio,
                        showTechIcons: preset.showTechIcons,
                        showProfileIcons: preset.showProfileIcons,
                        sectionTitleFontSizes: { ...(preset.sectionTitleFontSizes ?? {}) },
                      })
                    }
                  >
                    应用
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() =>
                      updateLayout({
                        presets: resume.layout.presets.filter((item) => item.id !== preset.id),
                      })
                    }
                  >
                    删除
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {aiError && <div className="error-text">{aiError}</div>}
        {pdfError && <div className="error-text">{pdfError}</div>}
        <PresetDatalists />
      </div>

      <div className="preview-panel">
        <div className="preview-page-indicator">第 {previewPage} / {previewPages} 页</div>
        <div className="preview-scroll" ref={previewRef}>
          <PaginatedResumeRenderer
            templateId={resume.templateId}
            props={{
              resume,
              sectionOrder: visibleSections,
              sectionItemsOrder: resume.layout.sectionItemsOrder,
              sectionRegions: resume.layout.sectionRegions,
              twoColumnRatio: resume.layout.twoColumnRatio,
            }}
            mode="preview"
            onPageCountChange={(count) => {
              setPreviewPages(count);
              setPreviewPage((prev) => Math.min(prev, count));
            }}
          />
        </div>
      </div>
    </div>
  );
};

const PresetDatalists = () => (
  <>
    <datalist id="preset-job-title">
      {presetOptions.jobTitle.map((item) => <option key={item} value={item} />)}
    </datalist>
    <datalist id="preset-job-direction">
      {presetOptions.jobDirection.map((item) => <option key={item} value={item} />)}
    </datalist>
    <datalist id="preset-years">
      {presetOptions.years.map((item) => <option key={item} value={item} />)}
    </datalist>
    <datalist id="preset-salary">
      {presetOptions.salary.map((item) => <option key={item} value={item} />)}
    </datalist>
    <datalist id="preset-degree">
      {presetOptions.degree.map((item) => <option key={item} value={item} />)}
    </datalist>
    <datalist id="preset-work-role">
      {presetOptions.workRole.map((item) => <option key={item} value={item} />)}
    </datalist>
    <datalist id="preset-project-role">
      {presetOptions.projectRole.map((item) => <option key={item} value={item} />)}
    </datalist>
  </>
);

const PeriodInput = ({ value, onChange }: { value: string; onChange: (next: string) => void }) => {
  const { start, end, ongoing } = parsePeriod(value);
  const startDate = start ? dayjs(`${start}-01`) : null;
  const endDate = end ? dayjs(`${end}-01`) : null;

  return (
    <div className="row-actions">
      <DatePicker
        views={['year', 'month']}
        label="开始时间"
        format="YYYY-MM"
        value={startDate}
        onChange={(next) => onChange(formatPeriod(next ? next.format('YYYY-MM') : '', end, ongoing))}
        slotProps={{
          textField: {
            size: 'small',
            fullWidth: true,
          },
        }}
      />
      <DatePicker
        views={['year', 'month']}
        label="结束时间"
        format="YYYY-MM"
        value={endDate}
        onChange={(next) => onChange(formatPeriod(start, next ? next.format('YYYY-MM') : '', false))}
        slotProps={{
          textField: {
            size: 'small',
            fullWidth: true,
          },
        }}
      />
      <Label className="inline-check">
        <Checkbox
          checked={ongoing}
          onChange={(event) => onChange(formatPeriod(start, event.target.checked ? '' : end, event.target.checked))}
        />
        至今
      </Label>
    </div>
  );
};

const TechStackInput = ({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) => {
  const [draft, setDraft] = useState<string>(() => formatTechStack(value));

  useEffect(() => {
    setDraft(formatTechStack(value));
  }, [value]);

  return (
    <Input
      placeholder="技术栈（逗号分隔）"
      value={draft}
      onChange={(event) => {
        const nextDraft = event.target.value;
        setDraft(nextDraft);
        onChange(parseTechStack(nextDraft));
      }}
    />
  );
};

interface EditableListSectionProps<T extends { id: string }> {
  title: string;
  sectionId: string;
  items: T[];
  onChange: (next: T[]) => void;
  createItem: () => T;
  renderItem: (item: T, update: (next: T) => void) => ReactNode;
}

const EditableListSection = <T extends { id: string }>({
  title,
  sectionId,
  items,
  onChange,
  createItem,
  renderItem,
}: EditableListSectionProps<T>) => {
  const sortItems = (next: T[]) => onChange(next);

  return (
    <Card
      title={title}
      actions={
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            const next = [...items, createItem()];
            onChange(next);
          }}
        >
          新增
        </Button>
      }
    >
      <SortableList
        items={items}
        getId={(item) => item.id}
        onReorder={sortItems}
        itemClassName="sortable-item"
        render={(item) => (
          <div className="list-editor-item" data-section={sectionId}>
            {renderItem(item, (next) => {
              onChange(items.map((entry) => (entry.id === item.id ? next : entry)));
            })}
            <Button
              type="button"
              variant="danger"
              onClick={() => {
                const next = items.filter((entry) => entry.id !== item.id);
                onChange(next);
              }}
            >
              删除
            </Button>
          </div>
        )}
      />
    </Card>
  );
};
