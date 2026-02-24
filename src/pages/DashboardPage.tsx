import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../shared/ui/Button';
import { Card } from '../shared/ui/Card';
import { useResumeStore } from '../store/useResumeStore';
import { formatDateTime, downloadJson, readJsonFile } from '../shared/utils/file';
import { resumeRepo } from '../core/storage/resumeRepo';
import type { ExportPayload } from '../core/storage/migrations';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { resumes, loadAll, createResume, deleteResume, duplicateResume } = useResumeStore();

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  return (
    <main className="page">
      <header className="topbar">
        <h1>IT 简历生成器</h1>
        <div className="row-actions">
          <Button
            onClick={async () => {
              const resume = await createResume('新简历');
              navigate(`/resume/${resume.id}/edit`);
            }}
          >
            新建简历
          </Button>
          <Button
            variant="secondary"
            onClick={async () => {
              const payload = await resumeRepo.export();
              downloadJson(`resume-export-${Date.now()}.json`, payload);
            }}
          >
            导出全部 JSON
          </Button>
          <Button asChild variant="secondary" className="file-btn">
            <label>
              导入 JSON
              <input
                type="file"
                accept="application/json"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) {
                    return;
                  }
                  const payload = await readJsonFile<ExportPayload>(file);
                  await resumeRepo.import(payload);
                  await loadAll();
                }}
              />
            </label>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/settings">设置</Link>
          </Button>
        </div>
      </header>

      <section className="grid-cards">
        {resumes.map((resume) => (
          <Card
            key={resume.id}
            title={resume.title}
            actions={<span>{formatDateTime(resume.updatedAt)}</span>}
          >
            <p>模板：{resume.templateId}</p>
            <div className="row-actions">
              <Button onClick={() => navigate(`/resume/${resume.id}/edit`)}>编辑</Button>
              <Button variant="secondary" onClick={() => void duplicateResume(resume.id)}>复制</Button>
              <Button variant="danger" onClick={() => void deleteResume(resume.id)}>删除</Button>
            </div>
          </Card>
        ))}
      </section>
    </main>
  );
};
