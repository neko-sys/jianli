export class HttpError extends Error {
  status: number;
  body: string;

  constructor(status: number, body: string, message?: string) {
    super(message ?? `HTTP ${status}`);
    this.name = 'HttpError';
    this.status = status;
    this.body = body;
  }
}

export interface HttpRequestConfig extends RequestInit {
  timeoutMs?: number;
}

export interface HttpContext {
  url: string;
  config: HttpRequestConfig;
}

export type HttpMiddleware = (
  context: HttpContext,
  next: (context: HttpContext) => Promise<Response>,
) => Promise<Response>;

const withTimeout = async (url: string, config: HttpRequestConfig): Promise<Response> => {
  const { timeoutMs, ...rest } = config;
  if (!timeoutMs) {
    return fetch(url, rest);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...rest,
      signal: rest.signal ?? controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
};

export class HttpClient {
  private middlewares: HttpMiddleware[];

  constructor(middlewares: HttpMiddleware[] = []) {
    this.middlewares = middlewares;
  }

  use(middleware: HttpMiddleware): HttpClient {
    this.middlewares.push(middleware);
    return this;
  }

  async request(url: string, config: HttpRequestConfig = {}): Promise<Response> {
    const dispatch = async (index: number, ctx: HttpContext): Promise<Response> => {
      const middleware = this.middlewares[index];
      if (!middleware) {
        return withTimeout(ctx.url, ctx.config);
      }
      return middleware(ctx, (nextCtx) => dispatch(index + 1, nextCtx));
    };

    return dispatch(0, { url, config });
  }

  async getText(url: string, config: HttpRequestConfig = {}): Promise<string> {
    const response = await this.request(url, config);
    return response.text();
  }

  async getJson<T>(url: string, config: HttpRequestConfig = {}): Promise<T> {
    const response = await this.request(url, config);
    return response.json() as Promise<T>;
  }

  async postJson<T>(url: string, body: unknown, config: HttpRequestConfig = {}): Promise<T> {
    return this.getJson<T>(url, {
      ...config,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config.headers ?? {}),
      },
      body: JSON.stringify(body),
    });
  }

  async postText(url: string, body: string, config: HttpRequestConfig = {}): Promise<Response> {
    return this.request(url, {
      ...config,
      method: 'POST',
      body,
    });
  }
}

export const createHttpClient = (): HttpClient => {
  const client = new HttpClient();

  client.use(async (context, next) => {
    const response = await next(context);
    if (!response.ok) {
      const body = await response.text();
      throw new HttpError(response.status, body, `HTTP ${response.status}`);
    }
    return response;
  });

  client.use(async (context, next) => {
    try {
      return await next(context);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('请求超时，请稍后重试。');
      }
      throw error;
    }
  });

  return client;
};

export const appHttpClient = createHttpClient();
