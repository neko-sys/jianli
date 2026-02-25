import { useEffect, useRef, useState } from 'react';
import { ResumeTemplateRenderer, type ResumeTemplateProps } from './ResumeTemplateRenderer';
import { paginateTemplateDom } from './paginateDom';

interface PaginatedResumeRendererProps {
  templateId: string;
  props: ResumeTemplateProps;
  mode?: 'preview' | 'print';
  onPageCountChange?: (count: number) => void;
}

const waitForFonts = async (): Promise<void> => {
  if (typeof document === 'undefined' || !('fonts' in document) || !document.fonts) {
    return;
  }
  try {
    await document.fonts.ready;
  } catch {
    // Ignore font readiness failures and continue with best-effort layout.
  }
};

export const PaginatedResumeRenderer = ({
  templateId,
  props,
  mode = 'preview',
  onPageCountChange,
}: PaginatedResumeRendererProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const pagesRef = useRef<HTMLDivElement>(null);
  const [pageCount, setPageCount] = useState(1);
  const pageCountRef = useRef(1);
  const onPageCountChangeRef = useRef(onPageCountChange);

  useEffect(() => {
    onPageCountChangeRef.current = onPageCountChange;
  }, [onPageCountChange]);

  useEffect(() => {
    let disposed = false;
    let frameId = 0;

    const repaginate = async () => {
      const measure = measureRef.current;
      const pagesRoot = pagesRef.current;
      if (!measure || !pagesRoot) {
        return;
      }
      await waitForFonts();
      if (disposed) {
        return;
      }

      const sourceTemplate = measure.querySelector<HTMLElement>('.resume-template');
      if (!sourceTemplate) {
        pagesRoot.innerHTML = '';
        if (pageCountRef.current !== 1) {
          setPageCount(1);
          pageCountRef.current = 1;
          onPageCountChangeRef.current?.(1);
        }
        return;
      }

      const nextCount = paginateTemplateDom(sourceTemplate, pagesRoot);
      const normalizedCount = Math.max(1, nextCount);
      if (normalizedCount !== pageCountRef.current) {
        setPageCount(normalizedCount);
        pageCountRef.current = normalizedCount;
        onPageCountChangeRef.current?.(normalizedCount);
      }
    };

    const schedule = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        void repaginate();
      });
    };

    const resizeObserver =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => schedule());
    const mutationObserver =
      typeof MutationObserver === 'undefined'
        ? null
        : new MutationObserver(() => schedule());

    if (measureRef.current) {
      resizeObserver?.observe(measureRef.current);
      mutationObserver?.observe(measureRef.current, { childList: true, subtree: true, characterData: true });
    }
    window.addEventListener('resize', schedule);
    schedule();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', schedule);
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
    };
  }, [templateId, props]);

  return (
    <div
      ref={rootRef}
      className={`resume-paginated-root mode-${mode}`}
      data-page-count={pageCount}
    >
      <div ref={measureRef} className="resume-paginated-measure" aria-hidden="true">
        <ResumeTemplateRenderer templateId={templateId} props={props} />
      </div>
      <div ref={pagesRef} className="resume-paginated-pages" />
    </div>
  );
};
