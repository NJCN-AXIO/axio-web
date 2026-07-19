import type { Metadata } from "next";
import type { ReactNode } from "react";

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
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
