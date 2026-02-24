import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ResumeTemplateRenderer } from '../features/templates/ResumeTemplateRenderer';
import { resumeRepo } from '../core/storage/resumeRepo';
import type { Resume } from '../core/domain/types';
import { Button } from '../shared/ui/Button';

export const PrintPage = () => {
  const { id = '' } = useParams();
  const [resume, setResume] = useState<Resume>();

  useEffect(() => {
    void (async () => {
      const data = await resumeRepo.get(id);
      setResume(data);
      setTimeout(() => {
        window.print();
      }, 200);
    })();
  }, [id]);

  if (!resume) {
    return (
      <main className="page">
        <p>未找到简历</p>
        <Button asChild variant="secondary">
          <Link to="/">返回</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="print-page">
      <ResumeTemplateRenderer
        templateId={resume.templateId}
        props={{
          resume,
          sectionOrder: resume.layout.sectionOrder.filter(
            (section) => resume.layout.sectionVisibility[section],
          ),
          sectionItemsOrder: resume.layout.sectionItemsOrder,
          sectionRegions: resume.layout.sectionRegions,
          twoColumnRatio: resume.layout.twoColumnRatio,
        }}
      />
    </main>
  );
};
