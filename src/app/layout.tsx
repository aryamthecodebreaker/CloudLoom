import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "CloudLoom — Open-Source Cloud & AI Security",
    template: "%s | CloudLoom",
  },
  description:
    "Open-source CNAPP blueprint: a working security-graph console running on a realistic simulated cloud. Free forever, live connectors on the roadmap.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
