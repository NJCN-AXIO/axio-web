"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { normalizeBasePath } from "../../config/site-path";
import type { NavigationLink } from "../../content/types";

type ActiveNavigationProps = {
  readonly ariaLabel: string;
  readonly className: string;
  readonly links: readonly NavigationLink[];
  readonly onNavigate?: () => void;
};

const basePath = normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH ?? "");

function normalizePath(pathname: string) {
  const withoutBasePath =
    basePath && (pathname === basePath || pathname.startsWith(`${basePath}/`))
      ? pathname.slice(basePath.length) || "/"
      : pathname;
  return withoutBasePath.replace(/\/+$/, "") || "/";
}

export function isNavigationLinkActive(
  href: string,
  pathname: string,
  hash: string,
) {
  const [hrefPath, fragment] = href.split("#", 2);
  if (normalizePath(hrefPath || "/") !== normalizePath(pathname)) {
    return false;
  }
  return fragment ? hash === `#${fragment}` : true;
}

export function ActiveNavigation({
  ariaLabel,
  className,
  links,
  onNavigate,
}: ActiveNavigationProps) {
  const pathname = usePathname();
  const [hash, setHash] = useState("");

  useEffect(() => {
    const syncHash = () => setHash(window.location.hash);
    syncHash();
    window.addEventListener("hashchange", syncHash);
    window.addEventListener("popstate", syncHash);
    return () => {
      window.removeEventListener("hashchange", syncHash);
      window.removeEventListener("popstate", syncHash);
    };
  }, [pathname]);

  return (
    <nav aria-label={ariaLabel} className={className}>
      {links.map((link) => {
        const active = isNavigationLinkActive(link.href, pathname, hash);
        return (
          <Link
            aria-current={
              active
                ? link.href.includes("#")
                  ? "location"
                  : "page"
                : undefined
            }
            href={link.href}
            key={link.href}
            onClick={() => {
              const fragment = link.href.split("#", 2)[1];
              setHash(fragment ? "#" + fragment : "");
              onNavigate?.();
            }}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
