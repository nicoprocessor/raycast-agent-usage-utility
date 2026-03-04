import { OAuth } from "@raycast/api";
import { providerIcon } from "./provider-branding";

const githubOAuthClient = new OAuth.PKCEClient({
  redirectMethod: OAuth.RedirectMethod.Web,
  providerName: "GitHub",
  providerIcon: providerIcon("github-copilot"),
  providerId: "github-copilot-oauth",
  description: "Authorize access to read GitHub Copilot usage metrics.",
});

type GitHubTokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
};

export async function authorizeGitHub(clientId: string): Promise<string> {
  const trimmedClientId = clientId.trim();
  if (!trimmedClientId) {
    throw new Error("GitHub OAuth Client ID missing. Set it in Extension Preferences.");
  }

  const request = await githubOAuthClient.authorizationRequest({
    endpoint: "https://github.com/login/oauth/authorize",
    clientId: trimmedClientId,
    scope: "read:user read:org",
  });
  const { authorizationCode } = await githubOAuthClient.authorize(request);

  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: trimmedClientId,
      code: authorizationCode,
      code_verifier: request.codeVerifier,
      redirect_uri: request.redirectURI,
    }),
  });

  const payload = (await response.json()) as GitHubTokenResponse;
  if (!response.ok || payload.error || !payload.access_token) {
    throw new Error(payload.error_description || payload.error || `GitHub OAuth failed with HTTP ${response.status}.`);
  }

  return payload.access_token;
}
