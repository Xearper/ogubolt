import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "OGUBolt - Premier Digital Services & Username Marketplace",
  description: "Join OGUBolt, the fastest growing community for trading digital services, usernames, and connecting with fellow entrepreneurs.",
  keywords: "digital services, usernames, marketplace, community forum, OGUBolt",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
