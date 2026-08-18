import type { Locale, SiteContent } from "./types";
import { zhCN } from "./zh-cn";

export function getSiteContent(locale: Locale = "zh-CN"): SiteContent {
  if (locale !== "zh-CN")
    throw new Error(`Unsupported locale: ${String(locale)}`);
  return zhCN;
}

export { capabilityGroups } from "./zh-cn";
export type {
  CapabilityGroup,
  CapabilityItem,
  CapabilityStatus,
  FaqGroup,
  FaqItem,
  Locale,
  NavigationLink,
  PackageOption,
  ProofValue,
  SiteContent,
} from "./types";
export type { PublicRelease } from "../config/public-release";
