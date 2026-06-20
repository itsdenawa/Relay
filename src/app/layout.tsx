import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Relay",
    template: "%s · Relay",
  },
  description: "Project management for focused product and creative teams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-dvh bg-zinc-950 text-zinc-50 antialiased">
        {children}
      </body>
    </html>
  );
}
