import { chromium } from 'playwright';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const sanitizeFilename = (name = 'resume') => name.replace(/[\\/:*?"<>|]/g, '-');

const toAsciiFilename = (name = 'resume') => {
  const ascii = name
    .normalize('NFKD')
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/["\\]/g, '')
    .trim();
  return ascii || 'resume';
};

const buildContentDisposition = (filename: string) => {
  const safeName = sanitizeFilename(filename);
  const asciiName = toAsciiFilename(safeName);
  const utf8Name = encodeURIComponent(safeName);
  return `attachment; filename="${asciiName}.pdf"; filename*=UTF-8''${utf8Name}.pdf`;
};

const launchBrowser = async () => {
  const launchArgs = {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  };

  if (process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH) {
    return chromium.launch({
      ...launchArgs,
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    });
  }

  try {
    return await chromium.launch(launchArgs);
  } catch {
    // fallback to local installed browsers
  }

  try {
    return await chromium.launch({ ...launchArgs, channel: 'chrome' });
  } catch {
    return chromium.launch({ ...launchArgs, channel: 'msedge' });
  }
};

export async function POST(request: Request): Promise<Response> {
  const html = await request.text();
  const encodedFilename = String(request.headers.get('x-file-name') ?? '');
  let filename = 'resume';

  if (encodedFilename) {
    try {
      filename = decodeURIComponent(encodedFilename) || 'resume';
    } catch {
      filename = 'resume';
    }
  }

  if (!html.trim()) {
    return new Response('参数缺失：html', { status: 400 });
  }

  let browser:
    | Awaited<ReturnType<typeof chromium.launch>>
    | undefined;
  try {
    browser = await launchBrowser();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle' });
    await page.emulateMedia({ media: 'print' });
    await page.evaluate(async () => {
      if (document.fonts) {
        await document.fonts.ready;
      }
    });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0mm',
        right: '0mm',
        bottom: '0mm',
        left: '0mm',
      },
      preferCSSPageSize: true,
    });

    return new Response(pdf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': buildContentDisposition(filename),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '未知错误';
    return new Response(`PDF 导出失败: ${message}`, { status: 500 });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
