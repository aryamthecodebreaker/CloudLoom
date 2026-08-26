import { db } from "@/lib/db";
import { ConsoleSidebar } from "@/components/console-sidebar";
import { CommandPalette } from "@/components/command-palette";
import { ToastProvider } from "@/components/toast";

export const dynamic = "force-dynamic";

export const metadata = { title: "Console" };

export default async function ConsoleLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const connected = await db.cloudAccount.count({
    where: { status: "CONNECTED" },
  });

  return (
    <div className="flex min-h-screen bg-cream">
      <ConsoleSidebar connected={connected} />
      <ToastProvider>
        <main id="main" className="h-screen flex-1 overflow-y-auto">{children}</main>
      </ToastProvider>
      <CommandPalette />
    </div>
  );
}
