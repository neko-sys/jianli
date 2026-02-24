import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
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
import { ResumeTemplateRenderer } from '../templates/ResumeTemplateRenderer';
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
  skillCategory: ['技术栈', '编程语言', '前端框架', '后端框架', '数据库', 'DevOps', '云服务'],
  workRole: ['前端工程师', '后端工程师', '全栈工程师', '测试工程师', '项目经理', '架构师'],
  projectRole: ['负责人', '核心开发', '前端负责人', '后端负责人', '测试负责人', '项目经理'],
};

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

export const ResumeEditor = ({ resume, onChange, onExportJson, onDownloadPdf }: EditorProps) => {
  const [aiLoadingId, setAiLoadingId] = useState<string>('');
  const [aiError, setAiError] = useState<string>('');
  const [pdfError, setPdfError] = useState<string>('');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [presetName, setPresetName] = useState<string>('');
  const [compactMode, setCompactMode] = useState<boolean>(() => localStorage.getItem('editor-compact-mode') === '1');
  const [leftTwoCol, setLeftTwoCol] = useState<boolean>(() => localStorage.getItem('editor-left-two-col') === '1');
  const previewRef = useRef<HTMLDivElement>(null);
  const ollama = useSettingsStore((state) => state.ollama);

  const sections = useMemo(() => resume.layout.sectionOrder, [resume.layout.sectionOrder]);
  const visibleSections = useMemo(
    () => resume.layout.sectionOrder.filter((section) => resume.layout.sectionVisibility[section]),
    [resume.layout.sectionOrder, resume.layout.sectionVisibility],
  );

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
    localStorage.setItem('editor-compact-mode', compactMode ? '1' : '0');
  }, [compactMode]);

  useEffect(() => {
    localStorage.setItem('editor-left-two-col', leftTwoCol ? '1' : '0');
  }, [leftTwoCol]);

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
                  const target = previewRef.current?.querySelector('.resume-template');
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
              <Button asChild variant="secondary" className="file-btn">
                <label>
                  上传头像
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => void uploadAvatar(event.target.files?.[0])}
                  />
                </label>
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
          <Label>邮箱</Label>
          <Input
            type="email"
            inputMode="email"
            placeholder="例如：name@example.com"
            value={resume.profile.email}
            onChange={(e) => updateResume({ profile: { ...resume.profile, email: e.target.value } })}
          />
          <Label>城市</Label>
          <Input
            list="preset-city"
            value={resume.profile.city}
            onChange={(e) => updateResume({ profile: { ...resume.profile, city: e.target.value } })}
          />
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
              <Input
                list="preset-skill-category"
                placeholder="分类"
                value={item.category}
                onChange={(e) => update({ ...item, category: e.target.value })}
              />
              <Textarea placeholder="内容" value={item.content} onChange={(e) => update({ ...item, content: e.target.value })} />
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
              <Input
                placeholder="技术栈（逗号分隔）"
                value={item.techStack.join(',')}
                onChange={(e) => update({ ...item, techStack: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
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

      <div className="preview-panel" ref={previewRef}>
        <ResumeTemplateRenderer
          templateId={resume.templateId}
          props={{
            resume,
            sectionOrder: visibleSections,
            sectionItemsOrder: resume.layout.sectionItemsOrder,
            sectionRegions: resume.layout.sectionRegions,
            twoColumnRatio: resume.layout.twoColumnRatio,
          }}
        />
      </div>
    </div>
  );
};

const PresetDatalists = () => (
  <>
    <datalist id="preset-city">
      {presetOptions.city.map((item) => <option key={item} value={item} />)}
    </datalist>
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
    <datalist id="preset-skill-category">
      {presetOptions.skillCategory.map((item) => <option key={item} value={item} />)}
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

  return (
    <div className="row-actions">
      <Input
        type="month"
        value={start}
        onChange={(event) => onChange(formatPeriod(event.target.value, end, ongoing))}
      />
      <Input
        type="month"
        value={end}
        disabled={ongoing}
        onChange={(event) => onChange(formatPeriod(start, event.target.value, ongoing))}
      />
      <Label className="inline-check">
        <Checkbox
          checked={ongoing}
          onChange={(event) => onChange(formatPeriod(start, end, event.target.checked))}
        />
        至今
      </Label>
    </div>
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
