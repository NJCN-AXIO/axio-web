"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { getSiteContent } from "../../content";

const content = getSiteContent();
const focusableSelector =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
const backgroundSelector = [
  "main",
  ".site-footer",
  ".site-header__brand",
  ".site-header__desktop-nav",
  ".theme-toggle",
  ".site-header__cta",
].join(",");

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    const backgroundStates = Array.from(
      document.querySelectorAll<HTMLElement>(backgroundSelector),
      (element) => ({
        ariaHidden: element.getAttribute("aria-hidden"),
        element,
        inert: element.getAttribute("inert"),
      }),
    );

    document.body.style.overflow = "hidden";
    for (const { element } of backgroundStates) {
      element.setAttribute("inert", "");
      element.setAttribute("aria-hidden", "true");
    }

    dialog?.querySelectorAll<HTMLElement>(focusableSelector)[0]?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab" || !dialog) return;

      const elements = Array.from(
        dialog.querySelectorAll<HTMLElement>(focusableSelector),
      );
      const first = elements[0];
      const last = elements.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      for (const { ariaHidden, element, inert } of backgroundStates) {
        if (inert === null) element.removeAttribute("inert");
        else element.setAttribute("inert", inert);

        if (ariaHidden === null) element.removeAttribute("aria-hidden");
        else element.setAttribute("aria-hidden", ariaHidden);
      }
      triggerRef.current?.focus();
    };
  }, [close, isOpen]);

  return (
    <div className="mobile-navigation">
      <button
        aria-controls="mobile-navigation-dialog"
        aria-expanded={isOpen}
        aria-label="打开导航菜单"
        className="icon-button mobile-navigation__trigger"
        onClick={() => setIsOpen(true)}
        ref={triggerRef}
        type="button"
      >
        <Menu aria-hidden="true" size={22} />
      </button>
      {isOpen ? (
        <div className="mobile-navigation__backdrop">
          <div
            aria-label="网站导航"
            aria-modal="true"
            className="mobile-navigation__dialog"
            id="mobile-navigation-dialog"
            ref={dialogRef}
            role="dialog"
          >
            <div className="mobile-navigation__topline">
              <span className="mobile-navigation__brand">
                {content.brand.name}
              </span>
              <button
                aria-label="关闭导航菜单"
                className="icon-button"
                onClick={close}
                type="button"
              >
                <X aria-hidden="true" size={22} />
              </button>
            </div>
            <nav aria-label="移动端主导航" className="mobile-navigation__links">
              {content.navigation.map((link) => (
                <Link href={link.href} key={link.href} onClick={close}>
                  {link.label}
                </Link>
              ))}
            </nav>
            <Link
              className="button button--primary mobile-navigation__cta"
              href={content.hero.primaryCta.href}
              onClick={close}
            >
              {content.hero.primaryCta.label}
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
