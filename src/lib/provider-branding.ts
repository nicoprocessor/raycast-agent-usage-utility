import { environment, type Image } from "@raycast/api";
import path from "node:path";
import { ProviderKind } from "./types";

const PROVIDER_ICON_MAP: Record<ProviderKind, Image.ImageLike> = {
  anthropic: path.join(environment.assetsPath, "providers", "anthropic.svg"),
  "openai-codex": path.join(environment.assetsPath, "providers", "openai-codex.svg"),
  "github-copilot": path.join(environment.assetsPath, "providers", "github-copilot.svg"),
};

const PROVIDER_LABEL_MAP: Record<ProviderKind, string> = {
  anthropic: "Anthropic (Claude Code)",
  "openai-codex": "OpenAI (GPT Codex)",
  "github-copilot": "GitHub Copilot",
};

export function providerIcon(kind: ProviderKind): Image.ImageLike {
  return PROVIDER_ICON_MAP[kind];
}

export function providerLabel(kind: ProviderKind): string {
  return PROVIDER_LABEL_MAP[kind];
}
