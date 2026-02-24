import express from 'express';
import cors from 'cors';
import { chromium } from 'playwright';

const app = express();
const port = Number(process.env.PDF_SERVER_PORT ?? 4177);

app.use(cors({ origin: true }));
app.use(
  express.text({
    type: ['text/plain', 'text/html'],
    limit: '20mb',
  }),
);

const sanitizeFilename = (name = 'resume') => name.replace(/[\\/:*?"<>|]/g, '-');

const toAsciiFilename = (name = 'resume') => {
  const ascii = name
    .normalize('NFKD')
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/["\\]/g, '')
    .trim();
  return ascii || 'resume';
};

const buildContentDisposition = (filename) => {
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
    // fallback to channel mode for local installed browsers
  }

  try {
    return await chromium.launch({ ...launchArgs, channel: 'chrome' });
  } catch {
    return chromium.launch({ ...launchArgs, channel: 'msedge' });
  }
};

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'local-playwright-pdf' });
});

app.post('/export-pdf', async (req, res) => {
  const html = typeof req.body === 'string' ? req.body : '';
  const encodedFilename = String(req.headers['x-file-name'] ?? '');
  let filename = 'resume';

  if (encodedFilename) {
    try {
      filename = decodeURIComponent(encodedFilename) || 'resume';
    } catch {
      filename = 'resume';
    }
  }

  if (!html.trim()) {
    res.status(400).send('参数缺失：html');
    return;
  }

  let browser;
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

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', buildContentDisposition(filename));
    res.send(pdf);
  } catch (error) {
    const message = error instanceof Error ? error.message : '未知错误';
    res.status(500).send(`PDF 导出失败: ${message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

app.use((error, _req, res, _next) => {
  if (error instanceof SyntaxError && 'body' in error) {
    res.status(400).send('请求格式错误：请用 text/plain 提交 HTML 内容。');
    return;
  }
  const message = error instanceof Error ? error.message : '服务器错误';
  res.status(500).send(message);
});

app.listen(port, () => {
  console.log(`PDF service listening at http://127.0.0.1:${port}`);
});
