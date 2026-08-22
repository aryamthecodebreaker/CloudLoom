"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Scroll reveal with per-variant motion — a single uniform fade-up on every
 * element is exactly what makes a page feel templated, so callers pick:
 *  - "up"    (default) content blocks
 *  - "left"  lists that read left-to-right
 *  - "fade"  quiet surfaces that shouldn't move at all
 */
export function Reveal({
  children,
  delay = 0,
  variant = "up",
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  variant?: "up" | "left" | "fade";
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const hidden =
    variant === "left"
      ? "-translate-x-6"
      : variant === "fade"
        ? ""
        : "translate-y-7";

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${
        shown ? "translate-x-0 translate-y-0 opacity-100" : `${hidden} opacity-0`
      } ${className}`}
      style={{ transitionDelay: `${delay}ms`, transitionProperty: "opacity, transform" }}
    >
      {children}
    </div>
  );
}
