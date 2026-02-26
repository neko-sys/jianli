import { appHttpClient, HttpError } from '../http/client';

const PDF_SERVER =
  process.env.NEXT_PUBLIC_PDF_SERVER_URL ??
  'http://127.0.0.1:4177/export-pdf';

const collectCssText = async (): Promise<string> => {
  const cssChunks: string[] = [];
  const sheets = Array.from(document.styleSheets);

  for (const sheet of sheets) {
    try {
      if (sheet.cssRules && sheet.cssRules.length > 0) {
        cssChunks.push(Array.from(sheet.cssRules).map((rule) => rule.cssText).join('\n'));
        continue;
      }
    } catch {
      // Cross-origin stylesheet; fallback below.
    }

    const href = sheet.href;
    if (!href) {
      continue;
    }
    try {
      cssChunks.push(await appHttpClient.getText(href));
    } catch {
      // Ignore unavailable stylesheets.
    }
  }

  return cssChunks.join('\n');
};

const buildPdfHtml = async (source: HTMLElement): Promise<string> => {
  const cssText = await collectCssText();
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
${cssText}
body { margin: 0; padding: 0; background: #fff; overflow: visible; }
.resume-template { margin: 0 auto !important; }
.resume-paginated-measure { display: none !important; }
.resume-page { margin: 0 !important; page-break-after: always; break-after: page; }
.resume-page:last-child { page-break-after: auto; break-after: auto; }
.resume-page .resume-template { box-shadow: none !important; }
  </style>
</head>
<body>
${source.outerHTML}
</body>
</html>`;
};

export const downloadPdfFromElement = async (
  source: HTMLElement,
  filename: string,
): Promise<void> => {
  const html = await buildPdfHtml(source);
  let blob: Blob;
  try {
    const response = await appHttpClient.postText(PDF_SERVER, html, {
      headers: {
        'Content-Type': 'text/plain; charset=UTF-8',
        'X-File-Name': encodeURIComponent(filename || 'resume'),
      },
      timeoutMs: 30000,
    });
    blob = await response.blob();
  } catch (error) {
    if (error instanceof HttpError) {
      throw new Error(error.body || 'PDF 导出失败，请检查本地 PDF 服务。');
    }
    throw error;
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename || 'resume'}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
};
