import { db } from "@/lib/db";
import { requireWorkspace } from "@/lib/rbac";
import { ConsoleSidebar } from "@/components/console-sidebar";
import { CommandPalette } from "@/components/command-palette";
import { ToastProvider } from "@/components/toast";

export const dynamic = "force-dynamic";

export const metadata = { title: "Console" };

export default async function ConsoleLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const ws = await requireWorkspace();
  const connected = await db.cloudAccount.count({
    where: { workspaceId: ws.workspaceId, status: "CONNECTED" },
  });

  return (
    <div className="flex min-h-screen bg-cream">
      <ConsoleSidebar connected={connected} workspaceName={ws.workspaceName} role={ws.role} />
      <ToastProvider>
        <main id="main" className="h-screen flex-1 overflow-y-auto">{children}</main>
      </ToastProvider>
      <CommandPalette />
    </div>
  );
}
