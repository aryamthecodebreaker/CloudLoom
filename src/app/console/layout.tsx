import { ConsoleSidebar } from "@/components/console-sidebar";

export const metadata = { title: "Console" };

export default function ConsoleLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen bg-loom-cream">
      <ConsoleSidebar />
      <main className="h-screen flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
