import type { Metadata } from "next";
import type { ReactNode } from "react";

import { SiteFooter } from "../components/site/site-footer";
import { SiteHeader } from "../components/site/site-header";
import { ThemeProvider } from "../components/theme/theme-provider";
import { ThemeScript } from "../components/theme/theme-script";

import "./globals.css";

const description = "跨境电商店群全自动化运营系统";

export const metadata: Metadata = {
  title: {
    default: "AXIO 智核",
    template: "%s | AXIO 智核",
  },
  description,
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html data-theme="light" lang="zh-CN" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <ThemeProvider>
          <SiteHeader />
          {children}
          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
