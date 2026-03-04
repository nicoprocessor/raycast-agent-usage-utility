import keytar from "keytar";

const KEYCHAIN_SERVICE = "raycast-agent-usage-utility";

export async function setProviderToken(providerId: string, token: string): Promise<void> {
  await keytar.setPassword(KEYCHAIN_SERVICE, providerId, token);
}

export async function getProviderToken(providerId: string): Promise<string> {
  const token = await keytar.getPassword(KEYCHAIN_SERVICE, providerId);
  if (!token) {
    throw new Error(`No token found in Keychain for provider '${providerId}'.`);
  }
  return token;
}

export async function deleteProviderToken(providerId: string): Promise<void> {
  await keytar.deletePassword(KEYCHAIN_SERVICE, providerId);
}
