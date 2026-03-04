import { LocalStorage } from "@raycast/api";
import { ProviderConfig } from "./types";

const PROVIDERS_KEY = "agent-usage.providers";

export async function loadProviders(): Promise<ProviderConfig[]> {
  const raw = await LocalStorage.getItem<string>(PROVIDERS_KEY);
  if (!raw) return [];
  const parsed = JSON.parse(raw) as ProviderConfig[];
  return Array.isArray(parsed) ? parsed : [];
}

export async function saveProviders(configs: ProviderConfig[]): Promise<void> {
  await LocalStorage.setItem(PROVIDERS_KEY, JSON.stringify(configs));
}
