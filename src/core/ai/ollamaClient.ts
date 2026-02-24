import { appHttpClient, HttpError } from '../../shared/http/client';

export interface OllamaConfig {
  baseUrl: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

interface ChatResponse {
  choices?: Array<{ message?: { content?: string } }>;
}

export const defaultOllamaConfig: OllamaConfig = {
  baseUrl: 'http://127.0.0.1:11434/v1',
  model: 'qwen3-vl:8b',
  temperature: 0.4,
  maxTokens: 600,
};

export const requestChat = async (
  config: OllamaConfig,
  systemPrompt: string,
  userPrompt: string,
): Promise<string> => {
  try {
    const json = await appHttpClient.postJson<ChatResponse>(
      `${config.baseUrl}/chat/completions`,
      {
        model: config.model,
        temperature: config.temperature,
        max_tokens: config.maxTokens,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      },
      { timeoutMs: 20000 },
    );
    return json.choices?.[0]?.message?.content?.trim() ?? '';
  } catch (error) {
    if (error instanceof HttpError) {
      throw new Error(`AI 请求失败(${error.status}): ${error.body}`);
    }
    throw error;
  }
};
