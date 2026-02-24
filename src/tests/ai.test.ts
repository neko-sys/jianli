import { describe, expect, it, vi } from 'vitest';
import { polishProjectDescription } from '../core/ai/resumePolishService';

const config = {
  baseUrl: 'http://127.0.0.1:11434/v1',
  model: 'qwen2.5:7b',
  temperature: 0.4,
  maxTokens: 600,
};

describe('resume polish service', () => {
  it('parses json output', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  candidates: ['候选1', '候选2'],
                  keywords: ['React', 'TypeScript'],
                }),
              },
            },
          ],
        }),
      }),
    );

    const result = await polishProjectDescription(config, {
      text: '原始项目描述',
      jobDirection: '前端',
      tone: '专业',
    });

    expect(result.candidates[0]).toBe('候选1');
    expect(result.keywords).toContain('React');
  });
});
