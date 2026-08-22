import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "CloudLoom — Open-Source Cloud & AI Security",
    template: "%s | CloudLoom",
  },
  description:
    "Open-source CNAPP that connects code, cloud, and runtime into one security graph so teams can find real risk and fix it fast.",
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
