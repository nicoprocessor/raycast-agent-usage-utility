import { ProviderConfig, ProviderKind } from "./types";

export type ProviderPreset = {
  kind: ProviderKind;
  title: string;
  tokenLabel: string;
  placeholders: {
    label: string;
    providerId: string;
    token: string;
    quotaUrl: string;
    authHeaderName: string;
    authScheme: string;
    limitPath: string;
    usedPath: string;
    periodPath: string;
    resetAtPath: string;
  };
  setupGuideMarkdown: string;
  defaultConfig: Omit<ProviderConfig, "id" | "label">;
};

export const PRESETS: ProviderPreset[] = [
  {
    kind: "anthropic",
    title: "Anthropic (Claude Code)",
    tokenLabel: "Anthropic API Key",
    placeholders: {
      label: "My Anthropic Account",
      providerId: "anthropic-main",
      token: "sk-ant-api03-...",
      quotaUrl: "https://api.anthropic.com/v1/organizations/usage",
      authHeaderName: "x-api-key",
      authScheme: "(empty)",
      limitPath: "limit",
      usedPath: "used",
      periodPath: "period",
      resetAtPath: "reset_at",
    },
    setupGuideMarkdown: `# Anthropic setup

1. Open https://console.anthropic.com/settings/keys
2. Create or copy your API key.
3. Paste it in **Anthropic API Key**.
4. Keep default usage endpoint and field mapping unless your org exposes a custom schema.
`,
    defaultConfig: {
      kind: "anthropic",
      quotaUrl: "https://api.anthropic.com/v1/organizations/usage",
      authHeaderName: "x-api-key",
      authScheme: "",
      extraHeaders: {
        "anthropic-version": "2023-06-01",
      },
      fieldMap: {
        limitPath: "limit",
        usedPath: "used",
        periodPath: "period",
        resetAtPath: "reset_at",
      },
    },
  },
  {
    kind: "openai-codex",
    title: "OpenAI (GPT Codex)",
    tokenLabel: "OpenAI API Key",
    placeholders: {
      label: "My OpenAI Account",
      providerId: "openai-main",
      token: "sk-proj-...",
      quotaUrl: "https://api.openai.com/v1/dashboard/billing/credit_grants",
      authHeaderName: "Authorization",
      authScheme: "Bearer",
      limitPath: "total_granted",
      usedPath: "total_used",
      periodPath: "period",
      resetAtPath: "expires_at",
    },
    setupGuideMarkdown: `# OpenAI setup

1. Open https://platform.openai.com/api-keys
2. Create/copy an API key.
3. Paste it in **OpenAI API Key**.
4. Keep Authorization + Bearer unless your endpoint is different.
`,
    defaultConfig: {
      kind: "openai-codex",
      quotaUrl: "https://api.openai.com/v1/dashboard/billing/credit_grants",
      authHeaderName: "Authorization",
      authScheme: "Bearer",
      fieldMap: {
        limitPath: "total_granted",
        usedPath: "total_used",
        periodPath: "period",
        resetAtPath: "expires_at",
      },
    },
  },
  {
    kind: "github-copilot",
    title: "GitHub Copilot",
    tokenLabel: "GitHub Token (classic or fine-grained)",
    placeholders: {
      label: "My GitHub Account",
      providerId: "github-main",
      token: "ghp_... / github_pat_...",
      quotaUrl: "https://api.github.com/copilot/usage",
      authHeaderName: "Authorization",
      authScheme: "Bearer",
      limitPath: "limit",
      usedPath: "used",
      periodPath: "period",
      resetAtPath: "reset_at",
    },
    setupGuideMarkdown: `# GitHub Copilot setup

1. Open https://github.com/settings/tokens
2. Generate a token with scopes needed to read Copilot usage in your account/org.
3. Paste token in **GitHub Token**.
4. Keep default endpoint and mapping for the standard usage response.
`,
    defaultConfig: {
      kind: "github-copilot",
      quotaUrl: "https://api.github.com/copilot/usage",
      authHeaderName: "Authorization",
      authScheme: "Bearer",
      extraHeaders: {
        Accept: "application/vnd.github+json",
      },
      fieldMap: {
        limitPath: "limit",
        usedPath: "used",
        periodPath: "period",
        resetAtPath: "reset_at",
      },
    },
  },
];

export function getPreset(kind: ProviderKind): ProviderPreset {
  const preset = PRESETS.find((item) => item.kind === kind);
  if (!preset) {
    throw new Error(`Unsupported provider: ${kind}`);
  }
  return preset;
}
