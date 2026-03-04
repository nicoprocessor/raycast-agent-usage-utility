import { Action, ActionPanel, Color, Icon, List, showToast, Toast } from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import { fetchUsage } from "./lib/usage";
import { loadProviders } from "./lib/storage";

type ProviderWithUsage = {
  id: string;
  label: string;
  kind: string;
  usage?: {
    remainingPercent: number;
    remaining: number;
    used: number;
    limit: number;
    period?: string;
    resetAt?: string;
  };
  error?: string;
};

export default function UsageStatusCommand() {
  const { data, isLoading, revalidate } = useCachedPromise(async () => {
    const providers = await loadProviders();
    const rows: ProviderWithUsage[] = await Promise.all(
      providers.map(async (provider) => {
        try {
          const usage = await fetchUsage(provider);
          return {
            id: provider.id,
            label: provider.label,
            kind: provider.kind,
            usage: {
              remainingPercent: usage.remainingPercent,
              remaining: usage.remaining,
              used: usage.used,
              limit: usage.limit,
              period: usage.period,
              resetAt: usage.resetAt,
            },
          };
        } catch (error) {
          return {
            id: provider.id,
            label: provider.label,
            kind: provider.kind,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      }),
    );

    if (rows.length === 0) {
      await showToast({
        style: Toast.Style.Failure,
        title: "No providers configured",
        message: "Run Add Provider first.",
      });
    }

    return rows;
  });

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search providers">
      {(data ?? []).map((item) => {
        const isHealthy = !item.error;
        const percent = item.usage?.remainingPercent ?? 0;
        const percentText = `${percent.toFixed(1)}% left`;

        return (
          <List.Item
            key={item.id}
            icon={{ source: isHealthy ? Icon.CheckCircle : Icon.Warning, tintColor: isHealthy ? Color.Green : Color.Red }}
            title={item.label}
            subtitle={item.kind}
            accessories={[
              { text: percentText },
              item.usage?.period ? { text: item.usage.period } : { text: "period n/a" },
            ]}
            detail={
              <List.Item.Detail
                markdown={isHealthy ? formatUsage(item) : `## Error\n\n${item.error}`}
                metadata={
                  <List.Item.Detail.Metadata>
                    <List.Item.Detail.Metadata.Label title="Provider ID" text={item.id} />
                    <List.Item.Detail.Metadata.Separator />
                    <List.Item.Detail.Metadata.Label title="Remaining" text={`${item.usage?.remaining ?? 0}`} />
                    <List.Item.Detail.Metadata.Label title="Used" text={`${item.usage?.used ?? 0}`} />
                    <List.Item.Detail.Metadata.Label title="Limit" text={`${item.usage?.limit ?? 0}`} />
                    <List.Item.Detail.Metadata.Label title="Remaining %" text={percentText} />
                    <List.Item.Detail.Metadata.Label title="Period" text={item.usage?.period ?? "n/a"} />
                    <List.Item.Detail.Metadata.Label title="Reset At" text={item.usage?.resetAt ?? "n/a"} />
                  </List.Item.Detail.Metadata>
                }
              />
            }
            actions={
              <ActionPanel>
                <Action title="Refresh" icon={Icon.ArrowClockwise} onAction={revalidate} />
              </ActionPanel>
            }
          />
        );
      })}
    </List>
  );
}

function formatUsage(item: ProviderWithUsage): string {
  if (!item.usage) {
    return "## No usage data";
  }

  return [
    `# ${item.label}`,
    "",
    `- **Remaining**: ${item.usage.remaining}`,
    `- **Used**: ${item.usage.used}`,
    `- **Limit**: ${item.usage.limit}`,
    `- **Remaining %**: ${item.usage.remainingPercent.toFixed(1)}%`,
    `- **Period**: ${item.usage.period ?? "n/a"}`,
    `- **Reset At**: ${item.usage.resetAt ?? "n/a"}`,
  ].join("\n");
}
