import Link from "next/link";

import { getSiteContent } from "../../content";

const content = getSiteContent();

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div>
          <strong>{content.brand.name}</strong>
          <p>{content.footer.boundary}</p>
        </div>
        <nav aria-label="页脚导航" className="site-footer__links">
          {content.footer.links.map((link) => (
            <Link href={link.href} key={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
        <small>
          © {new Date().getFullYear()} {content.footer.copyright}
        </small>
      </div>
    </footer>
  );
}
