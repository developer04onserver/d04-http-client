export class HttpError extends Error {
  constructor(message, { status, url, body } = {}) { super(message); this.name = "HttpError"; this.status = status; this.url = url; this.body = body; }
}
export function createHttpClient({ baseUrl = "", headers = {}, timeoutMs = 10000, retries = 0, fetchImpl = fetch } = {}) {
  async function request(path, options = {}) {
    const url = new URL(path, baseUrl || "http://localhost").toString();
    const method = (options.method ?? "GET").toUpperCase();
    let lastError;
    for (let attempt = 0; attempt <= (options.retries ?? retries); attempt++) {
      const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? timeoutMs);
      try {
        const response = await fetchImpl(url, { ...options, method, headers: { ...headers, ...(options.headers ?? {}) }, signal: controller.signal });
        const text = await response.text(); let body = text;
        if (text) { try { body = JSON.parse(text); } catch {} }
        if (!response.ok) throw new HttpError("HTTP " + response.status, { status: response.status, url, body });
        return { data: body, status: response.status, headers: response.headers };
      } catch (error) {
        lastError = error;
        const retryable = !(error instanceof HttpError) || [408, 425, 429, 500, 502, 503, 504].includes(error.status);
        if (!retryable || attempt >= (options.retries ?? retries)) throw error;
      } finally { clearTimeout(timer); }
      await new Promise(resolve => setTimeout(resolve, Math.min(200 * 2 ** attempt, 2000)));
    }
    throw lastError;
  }
  return {
    request,
    get: (path, options) => request(path, { ...options, method: "GET" }),
    post: (path, data, options) => request(path, { ...options, method: "POST", body: JSON.stringify(data), headers: { "content-type": "application/json", ...options?.headers } }),
    put: (path, data, options) => request(path, { ...options, method: "PUT", body: JSON.stringify(data), headers: { "content-type": "application/json", ...options?.headers } }),
    delete: (path, options) => request(path, { ...options, method: "DELETE" })
  };
}