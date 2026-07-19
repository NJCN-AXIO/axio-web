"use client";

import gsap from "gsap";
import { useEffect } from "react";

export function RevealController() {
  useEffect(() => {
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]"),
    );
    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced || typeof IntersectionObserver === "undefined") {
      gsap.set(nodes, { opacity: 1, y: 0 });
      return;
    }

    gsap.set(nodes, { opacity: 0, y: 18 });
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          gsap.to(entry.target, {
            opacity: 1,
            y: 0,
            duration: 0.55,
            ease: "power2.out",
            overwrite: true,
          });
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8%", threshold: 0.08 },
    );
    nodes.forEach((node) => observer.observe(node));

    return () => {
      observer.disconnect();
      gsap.killTweensOf(nodes);
    };
  }, []);

  return null;
}
