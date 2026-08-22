import { ConsoleSidebar } from "@/components/console-sidebar";

export const metadata = { title: "Console" };

export default function ConsoleLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen bg-wiz-cloud">
      <ConsoleSidebar />
      <main className="h-screen flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
