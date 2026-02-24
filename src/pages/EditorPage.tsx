import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ResumeEditor } from '../features/editor/ResumeEditor';
import { resumeRepo } from '../core/storage/resumeRepo';
import { downloadJson } from '../shared/utils/file';
import type { Resume } from '../core/domain/types';
import { useDebouncedEffect } from '../shared/utils/useDebouncedEffect';
import { downloadPdfFromElement } from '../shared/utils/pdf';

export const EditorPage = () => {
  const { id = '' } = useParams();
  const [resume, setResume] = useState<Resume>();

  useEffect(() => {
    void (async () => {
      const data = await resumeRepo.get(id);
      setResume(data);
    })();
  }, [id]);

  useDebouncedEffect(
    () => {
      if (!resume) {
        return;
      }
      void resumeRepo.save({ ...resume, updatedAt: Date.now() });
    },
    [resume],
    800,
  );

  const safeFileName = useMemo(
    () => (resume?.title?.trim() ? resume.title.trim().replace(/[\\\\/:*?\"<>|]/g, '-') : 'resume'),
    [resume?.title],
  );

  if (!resume) {
    return (
      <main className="page">
        <p>未找到简历。</p>
      </main>
    );
  }

  return (
    <main className="page editor-page">
      <ResumeEditor
        resume={resume}
        onChange={setResume}
        onExportJson={() => {
          downloadJson(`${resume.title || 'resume'}.json`, {
            schemaVersion: resume.schemaVersion,
            exportedAt: Date.now(),
            resumes: [resume],
          });
        }}
        onDownloadPdf={async (previewElement) => {
          await downloadPdfFromElement(previewElement, safeFileName);
        }}
      />
    </main>
  );
};
