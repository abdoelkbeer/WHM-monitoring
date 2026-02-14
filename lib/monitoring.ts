import axios from 'axios';

const CRITICAL_KEYWORDS = [
  'There has been a critical error',
  'Fatal error',
  'Error establishing a database connection'
];

export type CheckResult = {
  resultStatus: 'HEALTHY' | 'DOWN' | 'REDIRECT' | 'CRITICAL';
  httpStatus: number | null;
  responseTimeMs: number | null;
  finalUrl: string | null;
  redirectChain: string[];
  keywordMatch: string | null;
  evidence: Record<string, unknown>;
};

export async function runHttpCheck(url: string): Promise<CheckResult> {
  const chain: string[] = [];
  const start = Date.now();
  try {
    const response = await axios.get(url, {
      maxRedirects: 10,
      timeout: 15_000,
      validateStatus: () => true,
      responseType: 'text',
      beforeRedirect: (options) => {
        chain.push(`${options.protocol}//${options.hostname}${options.path}`);
      }
    });
    const responseTimeMs = Date.now() - start;
    const finalUrl = response.request?.res?.responseUrl ?? url;
    const domain = new URL(url).hostname;
    const finalHost = new URL(finalUrl).hostname;
    const body: string = typeof response.data === 'string' ? response.data : '';

    const keyword = CRITICAL_KEYWORDS.find((k) => body.includes(k)) ?? null;
    if ([500, 502, 503, 504].includes(response.status) || keyword) {
      return { resultStatus: 'CRITICAL', httpStatus: response.status, responseTimeMs, finalUrl, redirectChain: chain, keywordMatch: keyword, evidence: { status: response.status, keyword } };
    }

    const suspiciousChain = chain.some((u) => new URL(u).hostname !== domain);
    if (finalHost !== domain || suspiciousChain) {
      return { resultStatus: 'REDIRECT', httpStatus: response.status, responseTimeMs, finalUrl, redirectChain: chain, keywordMatch: null, evidence: { finalHost, domain, chain } };
    }

    return { resultStatus: 'HEALTHY', httpStatus: response.status, responseTimeMs, finalUrl, redirectChain: chain, keywordMatch: null, evidence: {} };
  } catch (error) {
    return {
      resultStatus: 'DOWN',
      httpStatus: null,
      responseTimeMs: Date.now() - start,
      finalUrl: null,
      redirectChain: chain,
      keywordMatch: null,
      evidence: { error: (error as Error).message }
    };
  }
}
