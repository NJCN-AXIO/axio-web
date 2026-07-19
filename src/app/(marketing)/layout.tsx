import type { ReactNode } from "react";

import "./marketing.css";

export default function MarketingLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return children;
}
