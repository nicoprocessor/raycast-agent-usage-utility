import { ProviderConfig, ProviderKind } from "./types";

type ProviderPreset = {
  kind: ProviderKind;
  title: string;
  defaultConfig: Omit<ProviderConfig, "id" | "label">;
};

export const PRESETS: ProviderPreset[] = [
  {
    kind: "anthropic",
    title: "Anthropic (Claude Code)",
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
