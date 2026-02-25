import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PaginatedResumeRenderer } from '../features/templates/PaginatedResumeRenderer';
import { resumeRepo } from '../core/storage/resumeRepo';
import type { Resume } from '../core/domain/types';
import { Button } from '../shared/ui/Button';

export const PrintPage = () => {
  const { id = '' } = useParams();
  const [resume, setResume] = useState<Resume>();
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    void (async () => {
      const data = await resumeRepo.get(id);
      setResume(data);
    })();
  }, [id]);

  useEffect(() => {
    if (!resume || !rootRef.current) {
      return;
    }
    let disposed = false;
    let printed = false;

    const tryPrint = async () => {
      if (disposed || printed || !rootRef.current) {
        return;
      }
      const pages = rootRef.current.querySelectorAll('.resume-page');
      if (pages.length === 0) {
        return;
      }
      if (document.fonts) {
        try {
          await document.fonts.ready;
        } catch {
          // Ignore font readiness failures and print best effort.
        }
      }
      if (disposed || printed) {
        return;
      }
      printed = true;
      window.print();
    };

    const observer = typeof MutationObserver === 'undefined'
      ? null
      : new MutationObserver(() => {
        void tryPrint();
      });
    observer?.observe(rootRef.current, { childList: true, subtree: true });
    void tryPrint();

    return () => {
      disposed = true;
      observer?.disconnect();
    };
  }, [resume]);

  if (!resume) {
    return (
      <main className="page">
        <p>未找到简历</p>
        <Link to="/">
          <Button variant="secondary">返回</Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="print-page" ref={rootRef}>
      <PaginatedResumeRenderer
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
        mode="print"
      />
    </main>
  );
};
