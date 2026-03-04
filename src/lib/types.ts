export type ProviderKind = "anthropic" | "openai-codex" | "github-copilot";

export type ProviderConfig = {
  id: string;
  label: string;
  kind: ProviderKind;
  quotaUrl: string;
  authHeaderName: string;
  authScheme?: string;
  extraHeaders?: Record<string, string>;
  fieldMap: {
    limitPath: string;
    usedPath: string;
    periodPath?: string;
    resetAtPath?: string;
  };
};

export type UsageSnapshot = {
  remainingPercent: number;
  limit: number;
  used: number;
  remaining: number;
  period?: string;
  resetAt?: string;
  raw: unknown;
};
