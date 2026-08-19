import type { Metadata } from "next";
import type { ReactNode } from "react";

import { SiteFooter } from "../components/site/site-footer";
import { SiteHeader } from "../components/site/site-header";
import { ThemeProvider } from "../components/theme/theme-provider";
import { ThemeScript } from "../components/theme/theme-script";

import "./globals.css";

const description = "Shopee 店群受控自动化运营系统";
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://njcn-axio.github.io/axio-web";

export const metadata: Metadata = {
  title: {
    default: "AXIO 智核",
    template: "%s | AXIO 智核",
  },
  description,
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "AXIO 智核",
    description,
    siteName: "AXIO 智核",
    type: "website",
    locale: "zh_CN",
  },
  twitter: {
    card: "summary",
    title: "AXIO 智核",
    description,
  },
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
          <a className="skip-link" href="#main-content">
            跳到主要内容
          </a>
          <SiteHeader />
          <div id="main-content">{children}</div>
          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
