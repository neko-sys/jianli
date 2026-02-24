import type { OllamaConfig } from './ollamaClient';
import { requestChat } from './ollamaClient';

export interface PolishInput {
  text: string;
  jobDirection: string;
  tone: '简洁' | '专业';
}

export interface PolishResult {
  candidates: string[];
  keywords: string[];
}

export const polishProjectDescription = async (
  config: OllamaConfig,
  input: PolishInput,
): Promise<PolishResult> => {
  const system = '你是资深IT简历顾问，擅长将项目经历写得简洁、专业、可量化。';
  const user = `请基于以下项目描述进行润色，输出JSON：{"candidates":["...","...","..."],"keywords":["..."]}。\n要求：语气${input.tone}，岗位方向${input.jobDirection}，每条候选不超过80字，突出技术和结果。\n原文：${input.text}`;

  const raw = await requestChat(config, system, user);

  try {
    const parsed = JSON.parse(raw) as Partial<PolishResult>;
    return {
      candidates: (parsed.candidates ?? []).slice(0, 3),
      keywords: (parsed.keywords ?? []).slice(0, 8),
    };
  } catch {
    const fallback = raw
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 3);

    return {
      candidates: fallback,
      keywords: [],
    };
  }
};
