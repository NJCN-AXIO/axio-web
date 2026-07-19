import Link from "next/link";

import { getSiteContent } from "../../content";
import { ThemeToggle } from "../theme/theme-toggle";
import { ActiveNavigation } from "./active-navigation";
import { MobileNavigation } from "./mobile-navigation";

const content = getSiteContent();

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link
          aria-label={content.brand.name}
          className="site-header__brand"
          href="/"
        >
          <span>{content.brand.name}</span>
        </Link>
        <ActiveNavigation
          ariaLabel="主导航"
          className="site-header__desktop-nav"
          links={content.navigation}
        />
        <div className="site-header__actions">
          <ThemeToggle />
          <Link
            className="button button--primary site-header__cta"
            href={content.hero.primaryCta.href}
          >
            {content.hero.primaryCta.label}
          </Link>
          <MobileNavigation />
        </div>
      </div>
    </header>
  );
}
