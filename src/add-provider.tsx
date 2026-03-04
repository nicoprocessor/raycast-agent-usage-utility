import { Action, ActionPanel, Detail, Form, Icon, showToast, Toast } from "@raycast/api";
import { useState } from "react";
import { getPreset, PRESETS } from "./lib/provider-presets";
import { setProviderToken } from "./lib/keychain";
import { loadProviders, saveProviders } from "./lib/storage";
import { ProviderKind } from "./lib/types";
import { providerIcon } from "./lib/provider-branding";

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
  return getPreset(kind);
}

export default function AddProviderCommand() {
  const [kind, setKind] = useState<ProviderKind>("anthropic");
  const preset = presetFor(kind);

  async function handleSubmit(values: FormValues) {
    const providerId = values.providerId.trim().toLowerCase();
    if (!providerId) {
      await showToast({ style: Toast.Style.Failure, title: "Provider ID is required" });
      return;
    }

    const existing = await loadProviders();
    if (existing.some((provider) => provider.id === providerId)) {
      await showToast({ style: Toast.Style.Failure, title: `Provider ID '${providerId}' already exists` });
      return;
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

    const token = values.token?.trim();
    if (!token) {
      await showToast({ style: Toast.Style.Failure, title: "API token is required" });
      return;
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
          <Action.Push
            icon={Icon.Info}
            title="Provider Setup Guide"
            shortcut={{ modifiers: ["cmd"], key: "g" }}
            target={<ProviderGuideDetail title={preset.title} markdown={preset.setupGuideMarkdown} />}
          />
        </ActionPanel>
      }
    >
      <Form.Dropdown id="kind" title="Provider" value={kind} onChange={(value) => setKind(value as ProviderKind)}>
        {PRESETS.map((item) => (
          <Form.Dropdown.Item key={item.kind} value={item.kind} title={item.title} icon={providerIcon(item.kind)} />
        ))}
      </Form.Dropdown>
      <Form.Description text="Press ⌘G for provider-specific setup instructions." />
      <Form.TextField key={`label-${kind}`} id="label" title="Display Name" placeholder={preset.placeholders.label} />
      <Form.TextField key={`provider-id-${kind}`} id="providerId" title="Provider ID" placeholder={preset.placeholders.providerId} />
      <Form.PasswordField key={`token-${kind}`} id="token" title={preset.tokenLabel} placeholder={preset.placeholders.token} />
      <Form.Separator />
      <Form.Description text="Customize only if your quota endpoint differs from the default provider setup." />
      <Form.TextField
        key={`quota-url-${kind}`}
        id="quotaUrl"
        title="Quota API URL"
        defaultValue={preset.defaultConfig.quotaUrl}
        placeholder={preset.placeholders.quotaUrl}
      />
      <Form.TextField
        key={`auth-header-${kind}`}
        id="authHeaderName"
        title="Auth Header Name"
        defaultValue={preset.defaultConfig.authHeaderName}
        placeholder={preset.placeholders.authHeaderName}
      />
      <Form.TextField
        key={`auth-scheme-${kind}`}
        id="authScheme"
        title="Auth Scheme (Optional)"
        defaultValue={preset.defaultConfig.authScheme || ""}
        placeholder={preset.placeholders.authScheme}
      />
      <Form.TextField
        key={`limit-path-${kind}`}
        id="limitPath"
        title="JSON Path: Limit"
        defaultValue={preset.defaultConfig.fieldMap.limitPath}
        placeholder={preset.placeholders.limitPath}
      />
      <Form.TextField
        key={`used-path-${kind}`}
        id="usedPath"
        title="JSON Path: Used"
        defaultValue={preset.defaultConfig.fieldMap.usedPath}
        placeholder={preset.placeholders.usedPath}
      />
      <Form.TextField
        key={`period-path-${kind}`}
        id="periodPath"
        title="JSON Path: Period (Optional)"
        defaultValue={preset.defaultConfig.fieldMap.periodPath || ""}
        placeholder={preset.placeholders.periodPath}
      />
      <Form.TextField
        key={`reset-path-${kind}`}
        id="resetAtPath"
        title="JSON Path: Reset At (Optional)"
        defaultValue={preset.defaultConfig.fieldMap.resetAtPath || ""}
        placeholder={preset.placeholders.resetAtPath}
      />
    </Form>
  );
}

function ProviderGuideDetail(props: { title: string; markdown: string }) {
  return <Detail markdown={props.markdown} navigationTitle={`${props.title} Guide`} />;
}
