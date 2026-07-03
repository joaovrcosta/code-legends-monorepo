"use client";

import { ThemeProvider } from "@/contexts/theme-context";
import { WorkspaceTabsProvider } from "@/components/layout/workspace-tabs-context";

export function ContentHubProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <WorkspaceTabsProvider>{children}</WorkspaceTabsProvider>
    </ThemeProvider>
  );
}
