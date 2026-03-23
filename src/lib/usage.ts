import { getProviderToken } from "./keychain";
import { ProviderConfig, UsageSnapshot } from "./types";

function getByPath(input: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((value, key) => {
    if (
      value &&
      typeof value === "object" &&
      key in (value as Record<string, unknown>)
    ) {
      return (value as Record<string, unknown>)[key];
    }
    return undefined;
  }, input);
}

function toNumber(value: unknown, field: string): number {
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) {
    throw new Error(`Invalid numeric field for ${field}.`);
  }
  return numeric;
}

function normalizePercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 100) return 100;
  return value;
}

export async function fetchUsage(
  config: ProviderConfig,
): Promise<UsageSnapshot> {
  const token = await getProviderToken(config.id);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(config.extraHeaders ?? {}),
  };

  const authPrefix = config.authScheme?.trim();
  headers[config.authHeaderName] = authPrefix
    ? `${authPrefix} ${token}`
    : token;

  const response = await fetch(config.quotaUrl, { method: "GET", headers });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(
      `HTTP ${response.status} - ${detail || "Unable to fetch usage."}`,
    );
  }

  const payload = (await response.json()) as unknown;
  const limit = toNumber(
    getByPath(payload, config.fieldMap.limitPath),
    "limitPath",
  );
  const used = toNumber(
    getByPath(payload, config.fieldMap.usedPath),
    "usedPath",
  );
  const remaining = Math.max(limit - used, 0);
  const remainingPercent = normalizePercent(
    (remaining / Math.max(limit, 1)) * 100,
  );
  const period = config.fieldMap.periodPath
    ? String(getByPath(payload, config.fieldMap.periodPath) ?? "")
    : undefined;
  const resetAt = config.fieldMap.resetAtPath
    ? String(getByPath(payload, config.fieldMap.resetAtPath) ?? "")
    : undefined;

  return {
    remainingPercent,
    limit,
    used,
    remaining,
    period: period || undefined,
    resetAt: resetAt || undefined,
    raw: payload,
  };
}
