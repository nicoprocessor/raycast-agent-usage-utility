import { Action, ActionPanel, Form, Icon, showToast, Toast } from "@raycast/api";
import { useState } from "react";
import { getPreset, PRESETS } from "./lib/provider-presets";
import { setProviderToken } from "./lib/keychain";
import { loadProviders, saveProviders } from "./lib/storage";
import { ProviderKind } from "./lib/types";

type FormValues = {
  kind: ProviderKind;
  label: string;
  providerId: string;
  token: string;
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
  const preset = presetFor(kind);

  async function handleSubmit(values: FormValues) {
    const providerId = values.providerId.trim().toLowerCase();
    if (!providerId) throw new Error("Provider ID is required.");
    if (!values.token.trim()) throw new Error("API token is required.");

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

    await setProviderToken(providerId, values.token.trim());
    await saveProviders([...existing, next]);

    await showToast({
      style: Toast.Style.Success,
      title: "Provider saved",
      message: `${next.label} added with token in Keychain`,
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
          <Form.Dropdown.Item key={item.kind} value={item.kind} title={item.title} />
        ))}
      </Form.Dropdown>
      <Form.TextField id="label" title="Display Name" placeholder="My Anthropic Account" />
      <Form.TextField id="providerId" title="Provider ID" placeholder="anthropic-main" />
      <Form.PasswordField id="token" title="API Token" />
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
