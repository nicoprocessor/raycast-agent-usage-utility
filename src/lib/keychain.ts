import { execFile } from "node:child_process";
import { promisify } from "node:util";

const KEYCHAIN_SERVICE = "raycast-agent-usage-utility";
const execFileAsync = promisify(execFile);

async function runSecurity(args: string[]): Promise<string> {
  const { stdout } = await execFileAsync("/usr/bin/security", args);
  return stdout.trim();
}

export async function setProviderToken(
  providerId: string,
  token: string,
): Promise<void> {
  await runSecurity([
    "add-generic-password",
    "-a",
    providerId,
    "-s",
    KEYCHAIN_SERVICE,
    "-U",
    "-w",
    token,
  ]);
}

export async function getProviderToken(providerId: string): Promise<string> {
  const token = await runSecurity([
    "find-generic-password",
    "-a",
    providerId,
    "-s",
    KEYCHAIN_SERVICE,
    "-w",
  ]);
  if (!token) {
    throw new Error(`No token found in Keychain for provider '${providerId}'.`);
  }
  return token;
}

export async function deleteProviderToken(providerId: string): Promise<void> {
  try {
    await runSecurity([
      "delete-generic-password",
      "-a",
      providerId,
      "-s",
      KEYCHAIN_SERVICE,
    ]);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("could not be found")
    ) {
      return;
    }
    throw error;
  }
}
