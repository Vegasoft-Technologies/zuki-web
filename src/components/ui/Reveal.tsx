"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Fades its element in as it scrolls into view.
 *
 * It renders the element itself rather than wrapping one, because the stylesheet
 * expects `reveal` to sit on the existing node — `hero__inner`, `gallery__item` and so
 * on — and adding a wrapper would change the document.
 *
 * Children are rendered on the server and passed through, so marking a section's inner
 * element as revealing does not pull that section into the browser bundle.
 */
interface RevealProps {
  /** The element to render. Matches whatever the reference markup uses. */
  as?: "div" | "ul" | "figure";
  /** The element's own classes. `reveal` is appended here. */
  className: string;
  children: ReactNode;
  "data-caption"?: string;
}

export default function Reveal({
  as = "div",
  className,
  children,
  ...rest
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Someone who has asked for less motion gets the end state straight away.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) {
      const frame = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          setShown(true);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const Tag = as;
  const classes = shown ? `${className} reveal in` : `${className} reveal`;

  return (
    <Tag
      // A callback ref, because one typed ref object cannot satisfy div, ul and figure
      // at the same time.
      ref={(node: HTMLElement | null) => {
        ref.current = node;
      }}
      className={classes}
      {...rest}
    >
      {children}
    </Tag>
  );
}
