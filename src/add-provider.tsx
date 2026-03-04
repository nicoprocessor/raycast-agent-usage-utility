import { Action, ActionPanel, Form, Icon, showToast, Toast } from "@raycast/api";
import { useState } from "react";
import { getPreset, PRESETS } from "./lib/provider-presets";
import { setProviderToken } from "./lib/keychain";
import { loadProviders, saveProviders } from "./lib/storage";
import { ProviderKind } from "./lib/types";
import { providerIcon } from "./lib/provider-branding";
import { authorizeGitHub } from "./lib/github-oauth";

type AuthMode = "token" | "oauth";

type FormValues = {
  kind: ProviderKind;
  authMode?: AuthMode;
  label: string;
  providerId: string;
  token?: string;
  githubOAuthClientId?: string;
  quotaUrl: string;
  authHeaderName: string;
  authScheme: string;
  limitPath: string;
  usedPath: string;
  periodPath?: string;
  resetAtPath?: string;
};

function presetFor(kind: ProviderKind) {
  return getPreset(kind).defaultConfig;
}

export default function AddProviderCommand() {
  const [kind, setKind] = useState<ProviderKind>("anthropic");
  const [authMode, setAuthMode] = useState<AuthMode>("token");
  const preset = presetFor(kind);
  const supportsOAuth = kind === "github-copilot";

  async function handleSubmit(values: FormValues) {
    const providerId = values.providerId.trim().toLowerCase();
    if (!providerId) throw new Error("Provider ID is required.");

    const existing = await loadProviders();
    if (existing.some((provider) => provider.id === providerId)) {
      throw new Error(`Provider ID '${providerId}' already exists.`);
    }

    const next = {
      id: providerId,
      label: values.label.trim() || providerId,
      kind: values.kind,
      quotaUrl: values.quotaUrl.trim(),
      authHeaderName: values.authHeaderName.trim(),
      authScheme: values.authScheme.trim(),
      fieldMap: {
        limitPath: values.limitPath.trim(),
        usedPath: values.usedPath.trim(),
        periodPath: values.periodPath?.trim() || undefined,
        resetAtPath: values.resetAtPath?.trim() || undefined,
      },
    };

    let token = values.token?.trim();
    if (values.kind === "github-copilot" && values.authMode === "oauth") {
      token = await authorizeGitHub(values.githubOAuthClientId || "");
    }
    if (!token) {
      throw new Error("API token is required.");
    }

    await setProviderToken(providerId, token);
    await saveProviders([...existing, next]);

    await showToast({
      style: Toast.Style.Success,
      title: "Provider saved",
      message: `${next.label} added with secure credentials`,
    });
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm icon={Icon.Plus} title="Save Provider" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.Dropdown id="kind" title="Provider" value={kind} onChange={(value) => setKind(value as ProviderKind)}>
        {PRESETS.map((item) => (
          <Form.Dropdown.Item key={item.kind} value={item.kind} title={item.title} icon={providerIcon(item.kind)} />
        ))}
      </Form.Dropdown>
      {supportsOAuth ? (
        <Form.Dropdown id="authMode" title="Auth Method" value={authMode} onChange={(value) => setAuthMode(value as AuthMode)}>
          <Form.Dropdown.Item value="oauth" title="OAuth (GitHub Login)" icon={Icon.Link} />
          <Form.Dropdown.Item value="token" title="Manual API Token" icon={Icon.Key} />
        </Form.Dropdown>
      ) : (
        <Form.Description text="Authentication method: Manual API Token (OAuth currently available for GitHub only)." />
      )}
      <Form.TextField id="label" title="Display Name" placeholder="My Anthropic Account" />
      <Form.TextField id="providerId" title="Provider ID" placeholder="anthropic-main" />
      {supportsOAuth && authMode === "oauth" ? (
        <Form.TextField id="githubOAuthClientId" title="GitHub OAuth Client ID" placeholder="Iv1.xxxxxxxx" />
      ) : (
        <Form.PasswordField id="token" title="API Token" />
      )}
      <Form.Separator />
      <Form.Description text="Customize only if your quota endpoint differs from the default provider setup." />
      <Form.TextField id="quotaUrl" title="Quota API URL" defaultValue={preset.quotaUrl} />
      <Form.TextField id="authHeaderName" title="Auth Header Name" defaultValue={preset.authHeaderName} />
      <Form.TextField id="authScheme" title="Auth Scheme (Optional)" defaultValue={preset.authScheme || ""} />
      <Form.TextField id="limitPath" title="JSON Path: Limit" defaultValue={preset.fieldMap.limitPath} />
      <Form.TextField id="usedPath" title="JSON Path: Used" defaultValue={preset.fieldMap.usedPath} />
      <Form.TextField id="periodPath" title="JSON Path: Period (Optional)" defaultValue={preset.fieldMap.periodPath || ""} />
      <Form.TextField id="resetAtPath" title="JSON Path: Reset At (Optional)" defaultValue={preset.fieldMap.resetAtPath || ""} />
    </Form>
  );
}
